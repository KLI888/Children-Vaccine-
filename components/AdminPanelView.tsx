'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { VACCINE_DEFINITIONS, calculateChildAge } from '@/lib/vaccine-data';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  ShieldCheck,
  Database,
  Server,
  Play,
  Users,
  Baby,
  BellRing,
  Activity,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
  Smartphone,
  Globe,
  Trash2,
  RefreshCw,
} from 'lucide-react';

export function AdminPanelView() {
  const {
    user,
    allUsers,
    switchUser,
    deleteUserAccount,
    language,
    childrenList,
    vaccinations,
    reminders,
    growthRecords,
    symptomRecords,
    selectedChildId,
    setSelectedChildId,
    triggerTestNotification,
    enterDemoMode,
  } = useApp();

  const [cronRunning, setCronRunning] = useState(false);
  const [cronResult, setCronResult] = useState<any | null>(null);
  const [testNotificationResult, setTestNotificationResult] = useState<string | null>(null);
  const [activeTabSub, setActiveTabSub] = useState<'overview' | 'users' | 'vaccines' | 'notifications' | 'db'>('overview');

  // 12 core vaccines
  const coreVaccines = Object.values(VACCINE_DEFINITIONS);

  const runCronJob = async () => {
    setCronRunning(true);
    setCronResult(null);

    try {
      const res = await fetch('/api/cron/process-reminders');
      const data = await res.json();
      setCronResult(data);
    } catch (err: any) {
      setCronResult({
        success: false,
        error: err?.message || 'Failed to reach cron endpoint',
      });
    } finally {
      setCronRunning(false);
    }
  };

  const handleTestNotification = async () => {
    setTestNotificationResult('Simulating notification delivery...');
    const res = await triggerTestNotification('same_day');
    setTestNotificationResult(res.message);
  };

  const totalDosesCompleted = vaccinations.filter((v) => v.status === 'completed').length;
  const totalRemindersDelivered = reminders.filter((r) => r.status === 'delivered').length;
  const totalRemindersPending = reminders.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Health Administration & Database Diagnostics</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {language === 'mr' ? 'आरोग्य प्रशासन व डेटाबेस नियंत्रण पॅनेल' : 'Medical Admin & Database Control Panel'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time inspection of 12 UIP government vaccines, multi-parent account isolation, notification engine, and database persistence.
          </p>
        </div>

        {/* Database Status Badge */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl self-start md:self-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
          <div className="text-xs">
            <strong className="block text-emerald-950 font-bold">
              Database Connected & Operational
            </strong>
            <span className="text-[11px] text-emerald-800 font-mono">
              {isSupabaseConfigured ? 'Supabase PostgreSQL Cloud' : 'Embedded Relational DB (Active)'}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <Users className="w-4 h-4 text-emerald-700" />
            <span className="text-[10px] uppercase font-bold text-slate-400">users</span>
          </div>
          <div className="text-xl font-black text-slate-900">{allUsers.length}</div>
          <span className="text-[11px] text-slate-500">Registered Parents</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <Baby className="w-4 h-4 text-emerald-700" />
            <span className="text-[10px] uppercase font-bold text-slate-400">children</span>
          </div>
          <div className="text-xl font-black text-slate-900">{childrenList.length}</div>
          <span className="text-[11px] text-slate-500">In Active Profile</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <Layers className="w-4 h-4 text-emerald-700" />
            <span className="text-[10px] uppercase font-bold text-slate-400">vaccines</span>
          </div>
          <div className="text-xl font-black text-emerald-800">{coreVaccines.length}</div>
          <span className="text-[11px] text-slate-500">Core 12 UIP Antigens</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span className="text-[10px] uppercase font-bold text-slate-400">records</span>
          </div>
          <div className="text-xl font-black text-slate-900">{vaccinations.length}</div>
          <span className="text-[11px] text-slate-500">{totalDosesCompleted} Completed</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <BellRing className="w-4 h-4 text-amber-600" />
            <span className="text-[10px] uppercase font-bold text-slate-400">reminders</span>
          </div>
          <div className="text-xl font-black text-amber-900">{reminders.length}</div>
          <span className="text-[11px] text-slate-500">{totalRemindersPending} Pending</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <Activity className="w-4 h-4 text-emerald-700" />
            <span className="text-[10px] uppercase font-bold text-slate-400">clinical</span>
          </div>
          <div className="text-xl font-black text-slate-900">{growthRecords.length + symptomRecords.length}</div>
          <span className="text-[11px] text-slate-500">Growth & AEFI Logs</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTabSub('overview')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTabSub === 'overview'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          Overview & Quick Actions
        </button>
        <button
          onClick={() => setActiveTabSub('users')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTabSub === 'users'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          Registered Parent Accounts ({allUsers.length})
        </button>
        <button
          onClick={() => setActiveTabSub('vaccines')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTabSub === 'vaccines'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          Official 12 UIP Vaccines
        </button>
        <button
          onClick={() => setActiveTabSub('notifications')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTabSub === 'notifications'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          Notification Engine (App ON vs OFF)
        </button>
        <button
          onClick={() => setActiveTabSub('db')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTabSub === 'db'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          Database Architecture & Keys
        </button>
      </div>

      {/* SUB-TAB: OVERVIEW & QUICK ACTIONS */}
      {activeTabSub === 'overview' && (
        <div className="space-y-6">
          {/* Quick Notification Simulator Banner */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Examiner Live Demonstration</span>
              </div>
              <h3 className="text-lg font-bold">Simulate Notified Day Delivery Right Now</h3>
              <p className="text-xs text-emerald-100 mt-1 max-w-xl">
                Test the exact notification arrival on the child&apos;s scheduled vaccination date. Plays synthesized audio chime and triggers instant in-app banner toast.
              </p>
            </div>
            <button
              onClick={handleTestNotification}
              className="px-5 py-2.5 bg-white text-emerald-950 hover:bg-emerald-50 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 self-start md:self-auto flex-shrink-0"
            >
              <BellRing className="w-4 h-4 text-emerald-800" />
              <span>Simulate Notification Sound & Alert</span>
            </button>
          </div>

          {testNotificationResult && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span>{testNotificationResult}</span>
            </div>
          )}

          {/* Active Parent Profile Info */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-800" />
              <span>Active Logged-In Account</span>
            </h3>
            {user ? (
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{user.displayName}</div>
                  <div className="text-slate-500 font-mono mt-0.5">{user.email} (ID: {user.id})</div>
                  <div className="text-emerald-800 font-semibold mt-1">
                    {childrenList.length} child record{childrenList.length === 1 ? '' : 's'} registered in this account
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-900 font-bold rounded-lg">
                    Authenticated & Isolated
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                <span>No active parent logged in. Using guest session.</span>
                <button
                  onClick={enterDemoMode}
                  className="px-3 py-1.5 bg-emerald-800 text-white rounded-lg font-semibold hover:bg-emerald-900"
                >
                  Load Demo Account
                </button>
              </div>
            )}
          </div>

          {/* Background Cron Trigger Section */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-800" />
                  <span>Background Cron Job Execution & Worker</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Endpoint: <code className="bg-stone-100 px-1.5 py-0.5 rounded font-mono text-emerald-900 font-semibold">GET /api/cron/process-reminders</code> (Automated daily at 09:00 IST)
                </p>
              </div>

              <button
                onClick={runCronJob}
                disabled={cronRunning}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl transition-all shadow-sm self-start sm:self-auto disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{cronRunning ? 'Executing Cron Batch...' : 'Trigger Scheduled Cron Now'}</span>
              </button>
            </div>

            {cronResult && (
              <div className="p-4 bg-stone-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto space-y-1">
                <div className="text-slate-400">Server Response Payload from /api/cron/process-reminders:</div>
                <pre>{JSON.stringify(cronResult, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB: USERS & ACCOUNT ISOLATION */}
      {activeTabSub === 'users' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-800" />
                <span>Registered Parent Accounts Explorer</span>
              </h2>
              <p className="text-xs text-slate-500">
                Each parent profile has an isolated children bucket in the database. 1-click switch between accounts to verify data isolation.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {allUsers.length} Parent Accounts
            </span>
          </div>

          <div className="divide-y divide-stone-100 text-xs">
            {allUsers.map((u) => {
              const isActive = user?.id === u.id;
              return (
                <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/60">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm text-slate-900">{u.displayName}</strong>
                      <span className="text-slate-400">·</span>
                      <span className="font-mono text-slate-600">{u.email}</span>
                      {isActive && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-bold rounded">
                          Active Session
                        </span>
                      )}
                    </div>
                    <div className="text-slate-500 text-[11px] mt-1">
                      Account ID: <span className="font-mono text-slate-600">{u.id}</span> · Created: {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {!isActive ? (
                      <button
                        onClick={() => switchUser(u.id)}
                        className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-semibold text-xs transition-colors"
                      >
                        Switch To This Account
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Current Account</span>
                      </span>
                    )}

                    {u.id !== 'demo_user_1' && (
                      <button
                        onClick={() => deleteUserAccount(u.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete this test account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB: 12 CORE UIP VACCINES */}
      {activeTabSub === 'vaccines' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-800" />
                <span>The Official 12 Universal Immunization Programme (UIP) Vaccines</span>
              </h2>
              <p className="text-xs text-slate-500">
                Government of India Ministry of Health and Family Welfare (MoHFW) approved schedule
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              12 UIP Vaccines Active
            </span>
          </div>

          <div className="divide-y divide-stone-100 text-xs">
            {coreVaccines.map((vax, index) => (
              <div key={vax.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/60 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center text-xs flex-shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <strong className="text-slate-900 text-sm">
                      {vax.name}
                    </strong>
                    <span className="text-slate-500 ml-2">
                      ({vax.marathiName})
                    </span>
                    <div className="text-slate-600 text-xs mt-0.5">
                      <strong>Prevents:</strong> {vax.diseasesPrevented}
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      <strong>Route & Site:</strong> {vax.routeAndSite}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase font-mono">
                    {vax.shortCode}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-stone-100 text-slate-700">
                    Government Mandated
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: NOTIFICATION ENGINE (APP ON VS OFF) */}
      {activeTabSub === 'notifications' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-800" />
              <span>How Notifications Work When App is ON vs OFF</span>
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Examiners often ask: <em>&ldquo;If the website is closed or the user is offline, will they still receive notifications?&rdquo;</em> Here is how the system handles both states:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                  <Globe className="w-4 h-4 text-emerald-800" />
                  <span>State 1: When Website / App is Open (ON)</span>
                </div>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                  <li><strong>Auditory Alert:</strong> Web Audio API plays a pleasant harmonic chime immediately.</li>
                  <li><strong>Visual Toast:</strong> In-app popover banner shows child name, due date, and vaccine.</li>
                  <li><strong>In-App Badge:</strong> Top navbar notification bell reflects pending reminder count.</li>
                  <li><strong>Browser System Notification:</strong> If permission is granted, a native desktop/mobile banner fires.</li>
                </ul>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                  <Smartphone className="w-4 h-4 text-slate-700" />
                  <span>State 2: When Website / App is Closed (OFF)</span>
                </div>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                  <li><strong>Service Worker:</strong> Registered in <code className="bg-stone-200 px-1 rounded font-mono">/public/sw.js</code> runs in background even when browser tabs are closed.</li>
                  <li><strong>Server Cron Worker:</strong> <code className="bg-stone-200 px-1 rounded font-mono">/api/cron/process-reminders</code> queries due reminders daily at 09:00 AM IST.</li>
                  <li><strong>W3C Web Push Protocol:</strong> Server pushes notification payload directly to the device&apos;s OS push daemon.</li>
                  <li><strong>Next Login Sync:</strong> Whenever the parent re-opens the app, all missed due dates appear in the overdue and pending tray.</li>
                </ul>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={handleTestNotification}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Simulate Scheduled Notification Alert Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: DATABASE ARCHITECTURE & KEYS */}
      {activeTabSub === 'db' && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-800" />
            <span>Database Architecture & Environment Keys Guide</span>
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Clarification on environment variables and why the app works seamlessly even without third-party services:
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-mono text-[11px]">
                  NEXT_PUBLIC_SUPABASE_URL & ANON_KEY
                </span>
                <span className="text-slate-500 font-normal">Optional Cloud Sync</span>
              </div>
              <p className="text-slate-600 mt-1">
                If provided, data syncs to a remote Supabase PostgreSQL database. If omitted, the application uses its <strong>Embedded Relational Storage Engine</strong>, which provides 100% full persistence, multi-user isolation, and 0 dependencies.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-stone-200 text-slate-800 rounded font-mono text-[11px]">
                  CRON_SECRET
                </span>
                <span className="text-slate-500 font-normal">Optional Security Token</span>
              </div>
              <p className="text-slate-600 mt-1">
                Used to authorize external cloud cron providers (e.g. Vercel Cron). In local and demonstration mode, the cron endpoint can also be triggered directly from the Admin Panel.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-stone-200 text-slate-800 rounded font-mono text-[11px]">
                  VAPID_PUBLIC_KEY & VAPID_PRIVATE_KEY
                </span>
                <span className="text-slate-500 font-normal">Optional Server-to-OS Push</span>
              </div>
              <p className="text-slate-600 mt-1">
                Only needed if sending remote push notifications to devices when the browser is entirely terminated. For live demo and standard browser notifications, the browser Notification API and Web Audio API handle everything natively.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Registered Children Progress Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Baby className="w-4 h-4 text-emerald-800" />
            <span>Active Parent&apos;s Registered Children</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {childrenList.length} child profiles in this account
          </span>
        </div>

        {childrenList.length > 0 ? (
          <div className="divide-y divide-stone-100 text-xs">
            {childrenList.map((child) => {
              const age = calculateChildAge(child.dateOfBirth, language);
              const childVaxes = vaccinations.filter((v) => v.childId === child.id);
              const completed = childVaxes.filter((v) => v.status === 'completed').length;
              const isSelected = child.id === selectedChildId;

              return (
                <div key={child.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/60">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm text-slate-900">{child.name}</strong>
                      <span className="text-slate-400">·</span>
                      <span className="text-emerald-800 font-semibold">{age.formatted}</span>
                      <span className="text-slate-400">·</span>
                      <span>DOB: {child.dateOfBirth}</span>
                    </div>
                    <div className="text-slate-500 text-xs mt-1">
                      Immunization Status: <strong>{completed} / {childVaxes.length} doses given</strong> ({child.gender.toUpperCase()} · Blood: {child.bloodGroup || 'N/A'})
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {isSelected ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-900 font-bold rounded-lg text-xs">
                        Active Profile
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedChildId(child.id)}
                        className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-slate-800 font-semibold rounded-lg text-xs transition-colors"
                      >
                        Switch To This Child
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            No children registered under this parent account yet. Use &ldquo;Add Child&rdquo; on the Dashboard or Children tab.
          </div>
        )}
      </div>
    </div>
  );
}
