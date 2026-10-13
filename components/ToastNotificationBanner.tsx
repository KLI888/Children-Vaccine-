'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { BellRing, X, ExternalLink, Volume2, Sparkles } from 'lucide-react';

interface ToastNotificationBannerProps {
  onOpenNotifications: () => void;
}

export function ToastNotificationBanner({ onOpenNotifications }: ToastNotificationBannerProps) {
  const { toastNotification, dismissToast, language } = useApp();

  if (!toastNotification) return null;

  let badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
  let badgeLabel = 'Vaccination Alert';

  if (toastNotification.stage === 'seven_day') {
    badgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';
    badgeLabel = 'Stage 1: -7 Days Advance';
  } else if (toastNotification.stage === 'three_day') {
    badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
    badgeLabel = 'Stage 2: -3 Days Notice';
  } else if (toastNotification.stage === 'same_day') {
    badgeColor = 'bg-rose-100 text-rose-900 border-rose-300';
    badgeLabel = 'Stage 3: Due Today (Day 0)';
  } else {
    badgeColor = 'bg-teal-100 text-teal-900 border-teal-300';
    badgeLabel = 'Live Test Notification';
  }

  return (
    <aside aria-label="Notification Alert" className="fixed top-20 right-4 z-50 max-w-sm sm:max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-white rounded-2xl p-4 shadow-2xl border-2 border-emerald-600/30 ring-4 ring-emerald-500/10 flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center animate-bounce">
              <BellRing className="w-4 h-4 text-emerald-100" />
            </div>
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeColor}`}>
                {badgeLabel}
              </span>
              <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-semibold mt-0.5">
                <Volume2 className="w-3 h-3" />
                <span>{language === 'mr' ? 'सूचना ध्वनी वाजवला' : 'Alert Sound Chime Played'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={dismissToast}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-stone-100 transition-colors"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-900">
            {toastNotification.title}
          </h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {toastNotification.message}
          </p>
        </div>

        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <button
            onClick={() => {
              dismissToast();
              onOpenNotifications();
            }}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'सूचना केंद्रात पहा' : 'View in Notification Center'}</span>
          </button>

          <button
            onClick={dismissToast}
            className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1 rounded"
          >
            {language === 'mr' ? 'बंद करा' : 'Dismiss'}
          </button>
        </div>
      </div>
    </aside>
  );
}
