'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { isAdminUser, getUserDataKey } from '@/lib/admin';
import { translations } from '@/lib/i18n';
import { VACCINE_DEFINITIONS, calculateChildAge } from '@/lib/vaccine-data';
import {
  ShieldCheck,
  Database,
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

  const isAdmin = isAdminUser(user);
  const [testNotificationResult, setTestNotificationResult] = useState<string | null>(null);
  const [activeTabSub, setActiveTabSub] = useState<'overview' | 'users' | 'vaccines' | 'notifications' | 'db'>('overview');

  const localSystemChildren: Array<(typeof childrenList)[number] & { parentName: string; parentEmail: string }> = [];
  if (typeof window !== 'undefined') {
    for (const parent of allUsers) {
      try {
        const raw = localStorage.getItem(getUserDataKey(parent.id));
        const parsed = raw ? JSON.parse(raw) : null;
        const children = Array.isArray(parsed?.children) ? parsed.children : [];
        for (const child of children) {
          localSystemChildren.push({
            ...child,
            parentName: parent.displayName,
            parentEmail: parent.email,
          });
        }
      } catch {
        // Ignore malformed local storage data while building admin overview
      }
    }
  }
  const systemChildren = localSystemChildren;

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-amber-900">Admin access required</h2>
        <p className="mt-2 text-sm text-amber-800">
          The admin panel is visible only to the system administrator account.
        </p>
      </div>
    );
  }

  // 12 core vaccines
  const coreVaccines = Object.values(VACCINE_DEFINITIONS);

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
            Accounts and child profiles are stored in this browser and are not synchronized to other devices.
          </p>
        </div>

        {/* Database Status Badge */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 border rounded-xl self-start md:self-auto bg-emerald-50 border-emerald-200">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          <div className="text-xs">
            <strong className="block text-slate-950 font-bold">
              Local browser storage
            </strong>
            <span className="text-[11px] text-slate-700 font-mono">
              Saved in this browser only
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <Users className="w-4 h-4 text-emerald-700" />
            <span className="text-[10px] uppercase font-bold text-slate-400">accounts</span>
          </div>
          <div className="text-xl font-black text-slate-900">{allUsers.length}</div>
          <span className="text-[11px] text-slate-500">Available in this browser</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <Baby className="w-4 h-4 text-emerald-700" />
            <span className="text-[10px] uppercase font-bold text-slate-400">children</span>
          </div>
          <div className="text-xl font-black text-slate-900">{systemChildren.length}</div>
          <span className="text-[11px] text-slate-500">Visible in this browser origin</span>
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
          User Accounts ({allUsers.length})
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
                    <span className="px-3 py-1 bg-amber-100 text-amber-900 font-bold rounded-lg">
                    Local demo account
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

        </div>
      )}

      {/* SUB-TAB: USERS & ACCOUNT ISOLATION */}
      {activeTabSub === 'users' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-800" />
                <span>Registered User Accounts</span>
              </h2>
              <p className="text-xs text-slate-500">
                Local account directory. Parent profiles can be switched in this browser; local storage is not secure storage for sensitive records.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {allUsers.length} Accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200 text-xs">
              <thead className="bg-stone-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left font-bold">User</th>
                  <th className="px-4 py-3 text-left font-bold">Role</th>
                  <th className="px-4 py-3 text-left font-bold">Email</th>
                  <th className="px-4 py-3 text-left font-bold">Created</th>
                  <th className="px-4 py-3 text-left font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {allUsers.map((u) => {
                  const isActive = user?.id === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-stone-50/60">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{u.displayName}</div>
                        <div className="font-mono text-[11px] text-slate-500">ID: {u.id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${u.role === 'admin' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-slate-700'}`}>
                          {u.role === 'admin' ? 'Admin' : 'Parent'}
                        </span>
                        {isActive && (
                          <span className="ml-2 inline-flex rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-900">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">{u.email}</td>
                      <td className="px-4 py-3 text-slate-600">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isActive ? (
                            <span className="text-xs font-bold text-emerald-700">Current</span>
                          ) : (
                            <button
                              onClick={() => switchUser(u.id)}
                              className="rounded-lg bg-emerald-800 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-900"
                            >
                              Switch
                            </button>
                          )}

                          {u.id !== 'demo_user_1' && u.role !== 'admin' && (
                            <button
                              onClick={() => deleteUserAccount(u.id)}
                              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                              title="Delete this account"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
                Browser notifications and in-app alerts run locally while this page is open. This version does not deliver alerts in the background or to other devices.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                  <Globe className="w-4 h-4 text-emerald-800" />
                  <span>Foreground behavior</span>
                </div>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                  <li>The test creates a browser-local reminder and shows an in-app toast.</li>
                  <li>Audio and native browser notifications depend on browser permissions and support.</li>
                  <li>This does not test delivery to other users or devices.</li>
                </ul>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                  <Smartphone className="w-4 h-4 text-slate-700" />
                  <span>Background delivery</span>
                </div>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                  <li>Browser notifications work while this app is open and permission is granted.</li>
                  <li>Background delivery to a closed browser or other devices is not available in local-only mode.</li>
                  <li>Use the app as a record-keeping aid, not as a substitute for medical advice or clinic follow-up.</li>
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
            <span>Local Data Storage</span>
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Accounts and child health records are saved in this browser's local storage.
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 text-xs">
              <strong className="block text-slate-900">Local browser storage</strong>
              <p className="text-slate-600 mt-1">
                Accounts and records are saved in this browser only. Export a backup from Settings before clearing browser data or moving to another device.
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
            <span>System-Wide Registered Children</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {systemChildren.length} child profiles visible in this browser
          </span>
        </div>

        {systemChildren.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200 text-xs">
              <thead className="bg-stone-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left font-bold">Child</th>
                  <th className="px-4 py-3 text-left font-bold">Parent</th>
                  <th className="px-4 py-3 text-left font-bold">DOB</th>
                  <th className="px-4 py-3 text-left font-bold">Gender</th>
                  <th className="px-4 py-3 text-left font-bold">Blood</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {systemChildren.map((child) => {
                  const age = calculateChildAge(child.dateOfBirth, language);
                  const isSelected = child.id === selectedChildId;

                  return (
                    <tr key={child.id} className="hover:bg-stone-50/60">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{child.name}</div>
                        <div className="text-[11px] text-emerald-800 font-semibold">{age.formatted}</div>
                        {isSelected && (
                          <span className="mt-1 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <div className="font-semibold text-slate-800">{child.parentName}</div>
                        <div className="font-mono text-[11px] text-slate-500">{child.parentEmail}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{child.dateOfBirth}</td>
                      <td className="px-4 py-3 text-slate-600">{child.gender}</td>
                      <td className="px-4 py-3 text-slate-600">{child.bloodGroup || 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            No children have been registered in the system yet.
          </div>
        )}
      </div>
    </div>
  );
}
