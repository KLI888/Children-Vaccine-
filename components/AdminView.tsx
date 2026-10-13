'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  Database,
  Table,
  Terminal,
  RefreshCw,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Play,
  FileCode,
  Layers,
  Search,
  Eye,
  ShieldCheck,
  BellRing,
  Cpu,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ReminderStage } from '@/lib/types';

export function AdminView() {
  const {
    user,
    language,
    childrenList,
    vaccinations,
    reminders,
    growthRecords,
    symptomRecords,
    deliveryLogs,
    preferences,
    triggerTestNotification,
    runBackgroundCronSimulation,
    resetToOfficialSeedData,
    deleteChild,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'tables' | 'cron' | 'schema'>('tables');
  const [selectedTable, setSelectedTable] = useState<
    'children' | 'child_vaccinations' | 'reminders' | 'growth_records' | 'symptom_records' | 'delivery_logs' | 'profiles'
  >('child_vaccinations');
  const [tableSearch, setTableSearch] = useState('');
  const [inspectedRow, setInspectedRow] = useState<any | null>(null);

  // Cron test state
  const [cronRunning, setCronRunning] = useState(false);
  const [cronResult, setCronResult] = useState<any | null>(null);

  // Test notification state
  const [testNotificationResult, setTestNotificationResult] = useState<{
    stage: string;
    message: string;
    nativePermission: string;
  } | null>(null);

  const handleTestStage = async (stage: ReminderStage) => {
    const res = await triggerTestNotification(stage);
    setTestNotificationResult({
      stage,
      message: res.message,
      nativePermission: res.nativePermission,
    });
  };

  const handleRunCron = async () => {
    setCronRunning(true);
    try {
      const res = await runBackgroundCronSimulation();
      setCronResult(res);
    } finally {
      setCronRunning(false);
    }
  };

  // Export full database as JSON
  const handleExportDatabase = () => {
    const dbDump = {
      exportedAt: new Date().toISOString(),
      databaseMode: isSupabaseConfigured ? 'supabase_postgres' : 'local_persistent_storage',
      tables: {
        profiles: user ? [user] : [],
        children: childrenList,
        child_vaccinations: vaccinations,
        reminders,
        growth_records: growthRecords,
        symptom_records: symptomRecords,
        notification_delivery_logs: deliveryLogs,
        notification_preferences: [preferences],
      },
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dbDump, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `cvm-database-dump-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Get records for current table
  const getTableData = () => {
    switch (selectedTable) {
      case 'children':
        return childrenList;
      case 'child_vaccinations':
        return vaccinations;
      case 'reminders':
        return reminders;
      case 'growth_records':
        return growthRecords;
      case 'symptom_records':
        return symptomRecords;
      case 'delivery_logs':
        return deliveryLogs;
      case 'profiles':
        return user ? [user] : [];
      default:
        return [];
    }
  };

  const rawRows = getTableData();
  const filteredRows = rawRows.filter((row: any) => {
    if (!tableSearch.trim()) return true;
    const jsonStr = JSON.stringify(row).toLowerCase();
    return jsonStr.includes(tableSearch.toLowerCase());
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            <Database className="w-4 h-4" />
            <span>Database Explorer & Admin Console</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            System Database & Background Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Inspect raw PostgreSQL tables, audit logs, trigger scheduled cron workers, and test push notifications.
          </p>
        </div>

        {/* Quick Database Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportDatabase}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all border border-stone-200"
            title="Export complete database as JSON"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export JSON Dump</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm('Reset database to clean MoHFW demo state?')) {
                resetToOfficialSeedData();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-all border border-emerald-300"
            title="Reload official seed data"
          >
            <RefreshCw className="w-4 h-4 text-emerald-700" />
            <span>Reload Official Seed Data</span>
          </button>
        </div>
      </div>

      {/* Database KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Database Mode</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-bold text-slate-900 truncate">
              {isSupabaseConfigured ? 'Supabase Postgres' : 'Local Persistent'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Zero-latency storage</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Children Profiles</span>
          <div className="text-2xl font-bold text-slate-900 mt-0.5">
            {childrenList.length}
          </div>
          <p className="text-[11px] text-slate-400">Total registered</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Vaccine Doses</span>
          <div className="text-2xl font-bold text-emerald-800 mt-0.5">
            {vaccinations.length}
          </div>
          <p className="text-[11px] text-slate-400">
            {vaccinations.filter((v) => v.status === 'completed').length} completed
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">3-Stage Reminders</span>
          <div className="text-2xl font-bold text-slate-900 mt-0.5">
            {reminders.length}
          </div>
          <p className="text-[11px] text-slate-400">
            {reminders.filter((r) => r.status === 'pending').length} pending in queue
          </p>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
        <button
          onClick={() => setActiveSubTab('tables')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
            activeSubTab === 'tables'
              ? 'bg-white text-emerald-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>Database Tables Explorer</span>
        </button>

        <button
          onClick={() => setActiveSubTab('cron')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
            activeSubTab === 'cron'
              ? 'bg-white text-emerald-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Cron & Push Tester</span>
        </button>

        <button
          onClick={() => setActiveSubTab('schema')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
            activeSubTab === 'schema'
              ? 'bg-white text-emerald-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>SQL Schema & Migrations</span>
        </button>
      </div>

      {/* SUB-TAB 1: Database Tables Explorer */}
      {activeSubTab === 'tables' && (
        <div className="space-y-4">
          {/* Table Selector & Search */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Table Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'child_vaccinations', label: 'child_vaccinations', count: vaccinations.length },
                { id: 'reminders', label: 'reminders', count: reminders.length },
                { id: 'children', label: 'children', count: childrenList.length },
                { id: 'growth_records', label: 'growth_records', count: growthRecords.length },
                { id: 'symptom_records', label: 'symptom_records', count: symptomRecords.length },
                { id: 'delivery_logs', label: 'delivery_logs', count: deliveryLogs.length },
                { id: 'profiles', label: 'profiles', count: user ? 1 : 0 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTable(tab.id as any)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                    selectedTable === tab.id
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : 'bg-stone-100 text-slate-700 hover:bg-stone-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedTable === tab.id ? 'bg-white/20 text-white' : 'bg-stone-200 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search within table */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter table rows..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-stone-200 rounded-xl bg-stone-50"
              />
            </div>
          </div>

          {/* Table Data View */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-900 font-mono">
                SELECT * FROM public.{selectedTable}
              </span>
              <span>Showing {filteredRows.length} of {rawRows.length} rows</span>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-stone-50 border-b border-stone-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px] sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    {selectedTable === 'child_vaccinations' && (
                      <>
                        <th className="py-2.5 px-3">Vaccine ID</th>
                        <th className="py-2.5 px-3">Dose</th>
                        <th className="py-2.5 px-3">Due Date</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Administered</th>
                        <th className="py-2.5 px-3">Actions</th>
                      </>
                    )}
                    {selectedTable === 'reminders' && (
                      <>
                        <th className="py-2.5 px-3">Stage</th>
                        <th className="py-2.5 px-3">Trigger Date</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Idempotency Key</th>
                        <th className="py-2.5 px-3">Actions</th>
                      </>
                    )}
                    {selectedTable === 'children' && (
                      <>
                        <th className="py-2.5 px-3">Name</th>
                        <th className="py-2.5 px-3">DOB</th>
                        <th className="py-2.5 px-3">Gender</th>
                        <th className="py-2.5 px-3">Blood Group</th>
                        <th className="py-2.5 px-3">Actions</th>
                      </>
                    )}
                    {selectedTable === 'growth_records' && (
                      <>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Weight (kg)</th>
                        <th className="py-2.5 px-3">Height (cm)</th>
                        <th className="py-2.5 px-3">Actions</th>
                      </>
                    )}
                    {selectedTable === 'symptom_records' && (
                      <>
                        <th className="py-2.5 px-3">Onset</th>
                        <th className="py-2.5 px-3">Temp (°F)</th>
                        <th className="py-2.5 px-3">Symptoms</th>
                        <th className="py-2.5 px-3">Doctor</th>
                        <th className="py-2.5 px-3">Actions</th>
                      </>
                    )}
                    {selectedTable === 'delivery_logs' && (
                      <>
                        <th className="py-2.5 px-3">Attempted At</th>
                        <th className="py-2.5 px-3">Channel</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Actions</th>
                      </>
                    )}
                    {selectedTable === 'profiles' && (
                      <>
                        <th className="py-2.5 px-3">Display Name</th>
                        <th className="py-2.5 px-3">Email</th>
                        <th className="py-2.5 px-3">Language</th>
                        <th className="py-2.5 px-3">Actions</th>
                      </>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                        No rows found in public.{selectedTable}
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row: any, idx: number) => (
                      <tr key={row.id || idx} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>

                        {selectedTable === 'child_vaccinations' && (
                          <>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">{row.vaccineId}</td>
                            <td className="py-2.5 px-3">{row.doseNumber}</td>
                            <td className="py-2.5 px-3">{row.dueDate}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                row.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : row.status === 'overdue'
                                  ? 'bg-amber-100 text-amber-900 font-bold'
                                  : 'bg-stone-100 text-slate-700'
                              }`}>
                                {row.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">{row.administeredDate || '—'}</td>
                          </>
                        )}

                        {selectedTable === 'reminders' && (
                          <>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">{row.stage}</td>
                            <td className="py-2.5 px-3">{row.triggerDate}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                row.status === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : row.status === 'pending'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-stone-100 text-slate-500'
                              }`}>
                                {row.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 truncate max-w-[180px]">{row.idempotencyKey}</td>
                          </>
                        )}

                        {selectedTable === 'children' && (
                          <>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">{row.name}</td>
                            <td className="py-2.5 px-3">{row.dateOfBirth}</td>
                            <td className="py-2.5 px-3">{row.gender}</td>
                            <td className="py-2.5 px-3">{row.bloodGroup || '—'}</td>
                          </>
                        )}

                        {selectedTable === 'growth_records' && (
                          <>
                            <td className="py-2.5 px-3">{row.measurementDate}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{row.weightKg} kg</td>
                            <td className="py-2.5 px-3">{row.heightCm ? `${row.heightCm} cm` : '—'}</td>
                          </>
                        )}

                        {selectedTable === 'symptom_records' && (
                          <>
                            <td className="py-2.5 px-3">{row.onsetTimestamp}</td>
                            <td className="py-2.5 px-3 font-bold text-amber-700">{row.temperatureF ? `${row.temperatureF}°F` : '—'}</td>
                            <td className="py-2.5 px-3 truncate max-w-[150px]">
                              {Array.isArray(row.symptomsObserved) ? row.symptomsObserved.join(', ') : '—'}
                            </td>
                            <td className="py-2.5 px-3">{row.consultedDoctor ? 'Yes' : 'No'}</td>
                          </>
                        )}

                        {selectedTable === 'delivery_logs' && (
                          <>
                            <td className="py-2.5 px-3">{row.attemptedAt}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-800">{row.channel}</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                {row.status}
                              </span>
                            </td>
                          </>
                        )}

                        {selectedTable === 'profiles' && (
                          <>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">{row.displayName}</td>
                            <td className="py-2.5 px-3">{row.email}</td>
                            <td className="py-2.5 px-3">{row.preferredLanguage}</td>
                          </>
                        )}

                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => setInspectedRow(row)}
                            className="p-1 text-slate-400 hover:text-emerald-800 hover:bg-stone-100 rounded transition-colors"
                            title="Inspect JSON record"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Cron & Notification Tester */}
      {activeSubTab === 'cron' && (
        <div className="space-y-5">
          {/* Live Notification Testing Card */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BellRing className="w-4 h-4 text-emerald-700" />
                <span>Live Test Notification Dispatcher (With Audio Chime & Banner)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Dispatches a real alert with an audible chime, triggers the floating screen banner, and writes a delivered record into the database.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleTestStage('seven_day')}
                className="p-3.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl text-left transition-all group"
              >
                <div className="text-xs font-bold text-emerald-900 flex items-center justify-between">
                  <span>Test Stage 1 (-7d)</span>
                  <Sparkles className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-[11px] text-emerald-800 mt-1">
                  7-Day advance planning notification
                </p>
              </button>

              <button
                onClick={() => handleTestStage('three_day')}
                className="p-3.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl text-left transition-all group"
              >
                <div className="text-xs font-bold text-amber-900 flex items-center justify-between">
                  <span>Test Stage 2 (-3d)</span>
                  <Sparkles className="w-4 h-4 text-amber-700 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-[11px] text-amber-800 mt-1">
                  3-Day confirmation notice
                </p>
              </button>

              <button
                onClick={() => handleTestStage('same_day')}
                className="p-3.5 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded-xl text-left transition-all group"
              >
                <div className="text-xs font-bold text-teal-900 flex items-center justify-between">
                  <span>Test Stage 3 (Day 0)</span>
                  <Sparkles className="w-4 h-4 text-teal-700 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-[11px] text-teal-800 mt-1">
                  Vaccination day alert
                </p>
              </button>
            </div>

            {testNotificationResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>{testNotificationResult.message}</span>
                </div>
                <div className="text-[11px] text-emerald-800 font-mono">
                  Stage: <strong>{testNotificationResult.stage}</strong> · Native Push Permission Status: <strong>{testNotificationResult.nativePermission}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Background Cron Simulator Card */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-700" />
                  <span>Execute Background Server Cron Worker</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calls the live server-side Route Handler <code className="text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">GET /api/cron/process-reminders</code>.
                </p>
              </div>

              <button
                onClick={handleRunCron}
                disabled={cronRunning}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-sm disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                <span>{cronRunning ? 'Executing Cron...' : 'Run Scheduled Cron Now'}</span>
              </button>
            </div>

            {cronResult && (
              <div className="p-4 bg-stone-900 text-emerald-400 rounded-xl text-xs font-mono space-y-2 overflow-x-auto">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2 text-slate-400">
                  <span>HTTP 200 OK — Execution Response</span>
                  <span>{cronResult.timestamp || new Date().toISOString()}</span>
                </div>
                <pre>{JSON.stringify(cronResult, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SQL Schema & Migrations */}
      {activeSubTab === 'schema' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                PostgreSQL Schema DDL & Row Level Security (RLS)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Target: Supabase Postgres · Located in <code className="font-mono text-emerald-900">supabase/migrations/20261013000000_init_schema.sql</code>
              </p>
            </div>
          </div>

          <div className="bg-stone-900 text-stone-200 p-4 rounded-xl text-xs font-mono max-h-[450px] overflow-y-auto leading-relaxed">
            <pre>{`-- Children Vaccine Mentor: PostgreSQL Database Schema
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT,
    preferred_language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    blood_group TEXT,
    birth_weight_kg NUMERIC(4,2),
    birth_height_cm NUMERIC(4,1)
);

CREATE TABLE public.child_vaccinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    vaccine_id TEXT NOT NULL,
    dose_number INT NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled',
    administered_date DATE,
    administered_facility TEXT,
    batch_number TEXT
);

CREATE TABLE public.reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    vaccination_id UUID NOT NULL REFERENCES public.child_vaccinations(id) ON DELETE CASCADE,
    stage TEXT NOT NULL CHECK (stage IN ('seven_day', 'three_day', 'same_day')),
    trigger_date DATE NOT NULL,
    idempotency_key TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending'
);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and manage their children"
    ON public.children FOR ALL USING (auth.uid() = parent_id);`}</pre>
          </div>
        </div>
      )}

      {/* JSON Record Inspector Modal */}
      {inspectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <span className="font-bold text-slate-900 text-sm font-mono">
                Inspect Record: public.{selectedTable}
              </span>
              <button
                onClick={() => setInspectedRow(null)}
                className="text-xs px-2.5 py-1 bg-stone-200 hover:bg-stone-300 rounded-lg text-slate-700 font-semibold"
              >
                Close
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 bg-stone-900 text-emerald-400 font-mono text-xs">
              <pre>{JSON.stringify(inspectedRow, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
