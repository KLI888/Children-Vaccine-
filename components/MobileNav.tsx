'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { LayoutDashboard, Calendar, BellRing, TrendingUp, Baby, ShieldCheck } from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface MobileNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export function MobileNav({ activeTab, setActiveTab }: MobileNavProps) {
  const { language, reminders, selectedChild } = useApp();
  const t = translations[language];

  const pendingRemindersCount = reminders.filter(
    (r) => r.childId === selectedChild?.id && r.status === 'pending'
  ).length;

  const tabs: Array<{ id: ActiveTab; label: string; icon: React.ElementType; badge?: number }> = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'calendar', label: t.nav.calendar, icon: Calendar },
    { id: 'reminders', label: t.nav.reminders, icon: BellRing, badge: pendingRemindersCount },
    { id: 'children', label: t.nav.children, icon: Baby },
    { id: 'growth', label: t.nav.growthTracker, icon: TrendingUp },
    { id: 'admin', label: language === 'mr' ? 'प्रशासन' : 'Admin', icon: ShieldCheck },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-1 py-1.5 flex justify-around items-center">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex flex-col items-center py-1 px-1.5 rounded-lg text-[10px] sm:text-[11px] transition-colors ${
              isActive ? 'text-emerald-800 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 mb-0.5 ${isActive ? 'text-emerald-800' : 'text-slate-500'}`} />
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-emerald-700 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="truncate max-w-[54px] sm:max-w-[64px]">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
