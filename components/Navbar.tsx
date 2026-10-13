'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { translations } from '@/lib/i18n';
import {
  Bell,
  Globe,
  Baby,
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Settings,
} from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface NavbarProps {
  onOpenNotifications: () => void;
  onOpenAuth: () => void;
  onSelectTab?: (tab: ActiveTab) => void;
}

export function Navbar({ onOpenNotifications, onOpenAuth, onSelectTab }: NavbarProps) {
  const {
    user,
    language,
    setLanguage,
    childrenList,
    selectedChildId,
    setSelectedChildId,
    inAppNotifications,
    logout,
  } = useApp();

  const t = translations[language];
  const [showChildMenu, setShowChildMenu] = useState(false);

  const pendingNotifCount = inAppNotifications.filter((n) => n.status === 'pending').length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => onSelectTab && onSelectTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-sm hover:bg-emerald-900 transition-colors">
            <ShieldCheck className="w-6 h-6 text-emerald-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                {t.app.name}
              </span>
              <span className="hidden sm:inline text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                12 UIP Vaccines
              </span>
            </div>
            <p className="hidden md:block text-xs text-slate-500 font-normal">
              {t.app.subtitle}
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Child Selector */}
          {childrenList.length > 0 ? (
            <div className="relative">
              <button
                onClick={() => setShowChildMenu(!showChildMenu)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-200"
                aria-label="Select Child"
              >
                <Baby className="w-4 h-4 text-emerald-700" />
                <span className="max-w-[100px] sm:max-w-[140px] truncate font-semibold">
                  {childrenList.find((c) => c.id === selectedChildId)?.name || childrenList[0]?.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showChildMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-stone-200 py-1.5 z-50">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {t.dashboard.selectChild}
                  </div>
                  {childrenList.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => {
                        setSelectedChildId(child.id);
                        setShowChildMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs sm:text-sm flex items-center justify-between transition-colors ${
                        child.id === selectedChildId
                          ? 'bg-emerald-50 text-emerald-900 font-bold'
                          : 'text-slate-700 hover:bg-stone-50'
                      }`}
                    >
                      <span className="truncate">{child.name}</span>
                      <span className="text-[11px] text-slate-400">
                        {child.gender === 'male' ? (language === 'mr' ? 'मुलगा' : 'Boy') : (language === 'mr' ? 'मुलगी' : 'Girl')}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onSelectTab && onSelectTab('children')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <Baby className="w-4 h-4" />
              <span>+ Add Child</span>
            </button>
          )}

          {/* Admin Panel Quick Link */}
          {onSelectTab && (
            <button
              onClick={() => onSelectTab('admin')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:text-emerald-900 bg-stone-100 hover:bg-emerald-50 rounded-lg transition-colors border border-stone-200"
              title="Admin Panel & Database Overview"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Admin & DB</span>
              <span className="sm:hidden">Admin</span>
            </button>
          )}

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-800 bg-stone-100 hover:bg-emerald-50 rounded-lg transition-colors border border-stone-200"
            title="Switch Language (English / मराठी)"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'en' ? 'मराठी' : 'EN'}</span>
          </button>

          {/* In-app Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-600 hover:text-emerald-800 hover:bg-stone-100 rounded-lg transition-colors"
            aria-label="View reminders and notifications"
          >
            <Bell className="w-5 h-5" />
            {pendingNotifCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-amber-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {pendingNotifCount}
              </span>
            )}
          </button>

          {/* User profile / auth */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                  {user.displayName}
                </div>
                <div className="text-[10px] text-emerald-700 font-medium truncate max-w-[120px]">
                  {user.email}
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title={`${t.nav.signOut} (${user.email})`}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
            >
              <User className="w-4 h-4" />
              <span>{t.nav.signIn}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
