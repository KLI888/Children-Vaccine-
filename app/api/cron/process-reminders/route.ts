import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { format } from 'date-fns';
import webpush from 'web-push';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@childrenvaccinementor.in';

if (vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  } catch (err) {
    console.warn('Failed to configure VAPID details:', err);
  }
}

/**
 * Scheduled Cron Handler: Processes due vaccination reminders.
 * Runs every 5 minutes in background on the server (Vercel Cron / Supabase Cron).
 * Even if the website/app is CLOSED on the user's phone, this server job wakes up
 * the device via the W3C Push API / Web Push Protocol and displays the notification!
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecretHeader = req.headers.get('x-cron-secret');
  const cronSecret = process.env.CRON_SECRET;

  // Authorization validation
  if (cronSecret) {
    const isBearerValid = authHeader === `Bearer ${cronSecret}`;
    const isHeaderValid = cronSecretHeader === cronSecret;
    if (!isBearerValid && !isHeaderValid) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid CRON_SECRET authorization.' },
        { status: 401 }
      );
    }
  }

  const startTime = Date.now();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const supabaseAdmin = getSupabaseAdmin();

  let processedCount = 0;
  let deliveredCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  let pushDispatchedCount = 0;

  try {
    if (supabaseAdmin) {
      // 1. Fetch pending reminders due today or earlier in batches
      const { data: dueReminders, error: fetchError } = await supabaseAdmin
        .from('reminders')
        .select(`
          id,
          idempotency_key,
          stage,
          trigger_date,
          user_id,
          child_id,
          vaccination_id,
          title_en,
          title_mr,
          message_en,
          message_mr,
          retry_count,
          child_vaccinations!inner (
            id,
            status,
            due_date
          ),
          notification_preferences!inner (
            enable_seven_day,
            enable_three_day,
            enable_same_day,
            preferred_language,
            enable_push
          )
        `)
        .eq('status', 'pending')
        .lte('trigger_date', todayStr)
        .lt('retry_count', 3)
        .limit(50);

      if (fetchError) {
        return NextResponse.json(
          { error: 'Failed to fetch due reminders', details: fetchError.message },
          { status: 500 }
        );
      }

      if (dueReminders && dueReminders.length > 0) {
        for (const item of dueReminders) {
          processedCount++;
          const vax = (item as any).child_vaccinations;
          const prefs = (item as any).notification_preferences;

          // Check if dose has already been completed
          if (vax.status === 'completed') {
            await supabaseAdmin
              .from('reminders')
              .update({ status: 'cancelled', updated_at: new Date().toISOString() })
              .eq('id', item.id);
            skippedCount++;
            continue;
          }

          // Check preference stage toggle
          const isStageAllowed =
            (item.stage === 'seven_day' && prefs.enable_seven_day) ||
            (item.stage === 'three_day' && prefs.enable_three_day) ||
            (item.stage === 'same_day' && prefs.enable_same_day);

          if (!isStageAllowed) {
            await supabaseAdmin
              .from('reminders')
              .update({ status: 'skipped_past', updated_at: new Date().toISOString() })
              .eq('id', item.id);
            skippedCount++;
            continue;
          }

          // 2. Deliver Web Push to closed devices via Push API
          if (prefs.enable_push && vapidPublicKey && vapidPrivateKey && item.user_id) {
            const { data: subscriptions } = await supabaseAdmin
              .from('push_subscriptions')
              .select('endpoint, p256dh, auth')
              .eq('user_id', item.user_id);

            if (subscriptions && subscriptions.length > 0) {
              const pushPayload = JSON.stringify({
                title: prefs.preferred_language === 'mr' ? item.title_mr : item.title_en,
                body: prefs.preferred_language === 'mr' ? item.message_mr : item.message_en,
                url: '/',
                tag: item.idempotency_key,
              });

              for (const sub of subscriptions) {
                try {
                  await webpush.sendNotification(
                    {
                      endpoint: sub.endpoint,
                      keys: { p256dh: sub.p256dh, auth: sub.auth },
                    },
                    pushPayload
                  );
                  pushDispatchedCount++;
                } catch (pushErr: any) {
                  // If subscription expired (410 Gone / 404), cleanup
                  if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
                    await supabaseAdmin
                      .from('push_subscriptions')
                      .delete()
                      .eq('endpoint', sub.endpoint);
                  }
                }
              }
            }
          }

          // 3. Mark reminder delivered in database
          const { error: updateError } = await supabaseAdmin
            .from('reminders')
            .update({
              status: 'delivered',
              delivered_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', item.id);

          if (!updateError) {
            deliveredCount++;
            // Log delivery entry in notification_delivery_logs
            await supabaseAdmin.from('notification_delivery_logs').insert({
              reminder_id: item.id,
              channel: 'all',
              status: 'success',
              response_payload: {
                stage: item.stage,
                trigger_date: item.trigger_date,
                web_push_dispatched: pushDispatchedCount > 0,
              },
            });
          } else {
            failedCount++;
            await supabaseAdmin
              .from('reminders')
              .update({
                retry_count: item.retry_count + 1,
                last_error: updateError.message,
                updated_at: new Date().toISOString(),
              })
              .eq('id', item.id);
          }
        }
      }
    }

    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      durationMs,
      metrics: {
        processed: processedCount,
        delivered: deliveredCount,
        skipped: skippedCount,
        failed: failedCount,
        webPushDispatched: pushDispatchedCount,
        backend: supabaseAdmin ? 'supabase_postgres' : 'standalone_mode',
      },
      message: 'Background cron executed. Devices alerted even if website was closed.',
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unhandled cron worker error',
        message: err?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
