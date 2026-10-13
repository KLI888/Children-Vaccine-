'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { VACCINE_DEFINITIONS } from '@/lib/vaccine-data';
import {
  BellRing,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  Calendar,
  Send,
  ShieldCheck,
  Smartphone,
  Power,
} from 'lucide-react';
import { ReminderStage, ReminderStatus } from '@/lib/types';
import { subscribeToPushNotifications } from '@/lib/push-notifications';

export function RemindersView() {
  const {
    language,
    selectedChild,
    reminders,
    preferences,
    updatePreferences,
    triggerTestNotification,
    markReminderDelivered,
  } = useApp();

  const t = translations[language];

  const [stageFilter, setStageFilter] = useState<'all' | ReminderStage>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'delivered' | 'skipped_past'>('all');
  const [testSent, setTestSent] = useState(false);
  const [offlinePushActive, setOfflinePushActive] = useState(false);

  const handleEnableOfflinePush = async () => {
    const success = await subscribeToPushNotifications('demo_user_1');
    if (success) {
      setOfflinePushActive(true);
      alert(language === 'mr'
        ? 'यशस्वी! आता ही वेबसाइट बंद असली तरीही आपल्या डिव्हाइसवर सूचना मिळतील.'
        : 'Success! Push subscription active. You will now receive reminders even when the website is closed.');
    }
  };

  if (!selectedChild) {
    return (
      <div className="text-center py-12 text-sm text-slate-500">
        {t.dashboard.noChildren}
      </div>
    );
  }

  const childReminders = reminders.filter((r) => r.childId === selectedChild.id);

  const filteredReminders = childReminders.filter((r) => {
    if (stageFilter !== 'all' && r.stage !== stageFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  }).sort((a, b) => a.triggerDate.localeCompare(b.triggerDate));

  const handleTestNotification = async () => {
    const success = await triggerTestNotification();
    if (success) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>3-Stage Reminder Guarantee</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t.reminders.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t.reminders.subtitle} — {selectedChild.name}
          </p>
        </div>

        {/* Browser Push Test Control */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTestNotification}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-all border border-emerald-300 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>{testSent ? 'Notification Sent!' : t.reminders.sendTestPush}</span>
          </button>
        </div>
      </div>

      {/* Closed Website Push Delivery Card */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-5 shadow-lg border border-emerald-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-base text-white">
              {language === 'mr'
                ? 'वेबसाइट बंद असतानाही सूचना मिळवा (Closed-App Delivery)'
                : 'Guaranteed Notifications Even When Website / App Is Closed'}
            </h3>
          </div>
          <p className="text-xs text-emerald-100/90 max-w-2xl leading-relaxed">
            {language === 'mr'
              ? 'आपला फोन लॉक असला किंवा ब्राउझर पूर्णपणे बंद असला तरीही, आमचा क्लाउड सर्व्हर (Cloud Server Cron) थेट आपल्या फोनवर पुश अलर्ट पाठवतो.'
              : 'Our cloud server cron runs independently in the background. Even if your browser is closed, computer is shut down, or phone screen is locked, push alerts wake up your device lock screen via the W3C Push API & Service Worker.'}
          </p>
        </div>

        <button
          onClick={handleEnableOfflinePush}
          className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2 flex-shrink-0"
        >
          <Power className="w-4 h-4 text-slate-950" />
          <span>{offlinePushActive ? 'Offline Push Enabled ✓' : (language === 'mr' ? 'ऑफलाइन पुश सूचना सुरू करा' : 'Enable Closed-Site Push')}</span>
        </button>
      </div>

      {/* Three Stage Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
            <span>Stage 1</span>
            <span className="font-mono text-slate-500">-7 Days</span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm">{t.reminders.sevenDayLabel}</h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            {language === 'mr'
              ? 'लसीकरणाच्या ७ दिवस आधी पालकांना भेटीचे नियोजन करण्यासाठी पाठवले जाते.'
              : 'Alerts parents 7 calendar days before due date to arrange clinic appointments and transport.'}
          </p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
            <span>Stage 2</span>
            <span className="font-mono text-slate-500">-3 Days</span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm">{t.reminders.threeDayLabel}</h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            {language === 'mr'
              ? '३ दिवस आधी आठवण करून देते जेणेकरून वेळेची खात्री करता येईल.'
              : 'Second notice 3 calendar days before to finalize clinic plans and confirm opening times.'}
          </p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-teal-800 uppercase tracking-wider mb-2">
            <span>Stage 3</span>
            <span className="font-mono text-slate-500">Day 0</span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm">{t.reminders.sameDayLabel}</h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            {language === 'mr'
              ? 'लसीकरणाच्या दिवशी सकाळी ९:०० वाजता अंतिम आठवण सूचना पाठवली जाते.'
              : 'Final alert dispatched at 9:00 AM on vaccination day ensuring the child receives their dose.'}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200">
        {/* Stage Filter */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
          {(['all', 'seven_day', 'three_day', 'same_day'] as const).map((stage) => (
            <button
              key={stage}
              onClick={() => setStageFilter(stage)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                stageFilter === stage
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {stage === 'all' && 'All Stages'}
              {stage === 'seven_day' && '-7 Days'}
              {stage === 'three_day' && '-3 Days'}
              {stage === 'same_day' && 'Day 0'}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
          {(['all', 'pending', 'delivered', 'skipped_past'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === st
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'all' && 'All Statuses'}
              {st === 'pending' && 'Scheduled Pending'}
              {st === 'delivered' && 'Delivered'}
              {st === 'skipped_past' && 'Skipped (Past)'}
            </button>
          ))}
        </div>
      </div>

      {/* Reminder Cards List */}
      <div className="space-y-3">
        {filteredReminders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
            <BellRing className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">{t.reminders.empty}</p>
          </div>
        ) : (
          filteredReminders.map((rem) => {
            const isPending = rem.status === 'pending';
            const isDelivered = rem.status === 'delivered';
            const isCancelled = rem.status === 'cancelled';

            let stageBadge = '-7 Days (Stage 1)';
            if (rem.stage === 'three_day') stageBadge = '-3 Days (Stage 2)';
            if (rem.stage === 'same_day') stageBadge = 'Vaccination Day (Stage 3)';

            return (
              <div
                key={rem.id}
                className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all ${
                  isPending
                    ? 'border-emerald-300 shadow-sm bg-gradient-to-r from-emerald-50/30 to-white'
                    : isDelivered
                    ? 'border-stone-200'
                    : 'border-stone-100 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                      {stageBadge}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Trigger Date: <strong>{rem.triggerDate}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${
                      isPending
                        ? 'bg-amber-100 text-amber-900'
                        : isDelivered
                        ? 'bg-emerald-100 text-emerald-900'
                        : isCancelled
                        ? 'bg-stone-100 text-stone-600'
                        : 'bg-stone-100 text-stone-500'
                    }`}>
                      {rem.status}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {language === 'mr' ? rem.titleMr : rem.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  {language === 'mr' ? rem.messageMr : rem.messageEn}
                </p>

                {/* Idempotency key footnote for technical transparency */}
                <div className="mt-3 pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
                  <span className="font-mono truncate max-w-md">
                    Key: {rem.idempotencyKey}
                  </span>
                  {isPending && (
                    <button
                      onClick={() => markReminderDelivered(rem.id)}
                      className="self-end text-emerald-800 hover:text-emerald-950 font-semibold"
                    >
                      {language === 'mr' ? 'वाचल्याची नोंद करा' : 'Mark as Delivered'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Background Cron Architecture Note */}
      <div className="bg-stone-100/80 rounded-2xl p-4 border border-stone-200 text-xs text-slate-600 flex items-start gap-3">
        <Info className="w-5 h-5 text-emerald-800 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-900">Server Background Delivery Engine:</strong>{' '}
          {t.reminders.cronEndpointInfo} Safe idempotency keys prevent duplicate deliveries during repeated cron runs. Pending reminders are automatically cancelled upon vaccination completion.
        </div>
      </div>
    </div>
  );
}
