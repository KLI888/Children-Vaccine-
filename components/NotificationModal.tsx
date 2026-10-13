'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { X, Bell, Check, BellRing, Sparkles } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const {
    language,
    reminders,
    selectedChild,
    markReminderDelivered,
    triggerTestNotification,
  } = useApp();

  const t = translations[language];

  if (!isOpen) return null;

  const relevantReminders = reminders
    .filter((r) => !selectedChild || r.childId === selectedChild.id)
    .sort((a, b) => b.triggerDate.localeCompare(a.triggerDate));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">
                {language === 'mr' ? 'स्मरणपत्र व सूचना केंद्र' : 'Reminder & Notification Center'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'mr' ? '३-टप्प्यांचे स्वयंचलित अलर्ट' : '3-Stage Automated Immunization Alerts'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Test Push button banner */}
        <div className="px-5 py-3 bg-emerald-50/80 border-b border-emerald-100/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs text-emerald-900">
            <Sparkles className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>
              {language === 'mr'
                ? 'स्क्रीनवर सूचना व ध्वनी तपासा'
                : 'Test audio chime & live notification toast'}
            </span>
          </div>
          <button
            onClick={() => triggerTestNotification('same_day')}
            className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0 shadow-sm"
          >
            {t.reminders.sendTestPush}
          </button>
        </div>

        {/* Reminder list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {relevantReminders.length === 0 ? (
            <div className="text-center py-10">
              <BellRing className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">{t.reminders.empty}</p>
            </div>
          ) : (
            relevantReminders.map((rem) => {
              const isPending = rem.status === 'pending';
              const isDelivered = rem.status === 'delivered';
              const isPastSkipped = rem.status === 'skipped_past';
              const isCancelled = rem.status === 'cancelled';

              let stageBadgeText = '';
              if (rem.stage === 'seven_day') stageBadgeText = '-7 Days (Stage 1)';
              else if (rem.stage === 'three_day') stageBadgeText = '-3 Days (Stage 2)';
              else stageBadgeText = 'Day 0 (Stage 3)';

              return (
                <div
                  key={rem.id}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isPending
                      ? 'bg-amber-50/50 border-amber-200'
                      : isDelivered
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : isCancelled
                      ? 'bg-stone-50 border-stone-200 opacity-60'
                      : 'bg-stone-50 border-stone-200 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                      {stageBadgeText}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {rem.triggerDate}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900">
                    {language === 'mr' ? rem.titleMr : rem.titleEn}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {language === 'mr' ? rem.messageMr : rem.messageEn}
                  </p>

                  <div className="mt-3 pt-2 border-t border-stone-200/50 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span>Status:</span>
                      <span className={`font-medium ${
                        isPending ? 'text-amber-700' : isDelivered ? 'text-emerald-700' : 'text-slate-500'
                      }`}>
                        {rem.status}
                      </span>
                    </div>

                    {isPending && (
                      <button
                        onClick={() => markReminderDelivered(rem.id)}
                        className="flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-medium hover:underline"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{language === 'mr' ? 'वाचले म्हणून खूण करा' : 'Mark as Seen'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
          >
            {language === 'mr' ? 'बंद करा' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
