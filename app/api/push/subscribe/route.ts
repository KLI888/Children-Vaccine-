import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Stores browser push subscriptions in the database.
 * Enables the server to wake up the user's device and show notifications
 * even when the website is completely closed / off!
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, subscription } = await req.json();

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Invalid push subscription payload.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (supabaseAdmin && userId) {
      const { error } = await supabaseAdmin.from('push_subscriptions').upsert(
        {
          user_id: userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          user_agent: req.headers.get('user-agent') || 'Browser',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' }
      );

      if (error) {
        console.error('Failed to store push subscription in Supabase:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Device subscribed to background push notifications successfully.',
      details: 'You will receive reminders on this device even when the website is closed.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', message: error?.message },
      { status: 500 }
    );
  }
}
