'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { translations } from '@/lib/i18n';
import {
  LayoutDashboard,
  Calendar,
  BellRing,
  Baby,
  TrendingUp,
  Activity,
  BookOpen,
  Settings,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'calendar'
  | 'reminders'
  | 'children'
  | 'growth'
  | 'symptoms'
  | 'library'
  | 'settings'
  | 'admin';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { language, reminders, vaccinations, selectedChild } = useApp();
  const t = translations[language];

  // Badges calculation
  const pendingRemindersCount = reminders.filter(
    (r) => r.childId === selectedChild?.id && r.status === 'pending'
  ).length;

  const overdueCount = vaccinations.filter(
    (v) => v.childId === selectedChild?.id && (v.status === 'overdue' || v.status === 'due_today')
  ).length;

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ElementType; badge?: number; badgeColor?: string }> = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    {
      id: 'calendar',
      label: t.nav.calendar,
      icon: Calendar,
      badge: overdueCount > 0 ? overdueCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'reminders',
      label: t.nav.reminders,
      icon: BellRing,
      badge: pendingRemindersCount > 0 ? pendingRemindersCount : undefined,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    { id: 'children', label: t.nav.children, icon: Baby },
    { id: 'growth', label: t.nav.growthTracker, icon: TrendingUp },
    { id: 'symptoms', label: t.nav.symptomLog, icon: Activity },
    { id: 'library', label: t.nav.vaccineLibrary, icon: BookOpen },
    { id: 'settings', label: t.nav.settings, icon: Settings },
    { id: 'admin', label: language === 'mr' ? 'प्रशासक पॅनेल (Admin)' : 'Admin & Database', icon: ShieldCheck },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-stone-200 bg-white min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-stone-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Safety notice in sidebar */}
      <div className="mt-auto pt-6 border-t border-stone-100">
        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60">
          <div className="flex items-start gap-2 text-slate-700 text-xs">
            <ShieldAlert className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px] text-slate-600">
              {t.app.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
