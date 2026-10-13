'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { translations } from '@/lib/i18n';
import {
  Settings,
  Bell,
  Globe,
  Clock,
  Download,
  Trash2,
  CheckCircle,
  Shield,
  User,
} from 'lucide-react';

export function SettingsView() {
  const {
    user,
    language,
    setLanguage,
    preferences,
    updatePreferences,
    childrenList,
    vaccinations,
    growthRecords,
    symptomRecords,
  } = useApp();

  const t = translations[language];

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [localPrefs, setLocalPrefs] = useState(preferences);

  const handleSave = () => {
    updatePreferences(localPrefs);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const exportData = () => {
    const exportPayload = {
      exportDate: new Date().toISOString(),
      user,
      children: childrenList,
      vaccinations,
      growthRecords,
      symptomRecords,
      preferences: localPrefs,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `children-vaccine-mentor-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {t.settings.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {t.settings.subtitle}
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm">
          <CheckCircle className="w-5 h-5 text-emerald-700 flex-shrink-0" />
          <span>{t.settings.settingsSaved}</span>
        </div>
      )}

      {/* Account Info */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <User className="w-4 h-4 text-emerald-700" />
          <span>Parent Account Profile</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60">
            <span className="text-slate-400">Parent Name:</span>
            <div className="font-semibold text-slate-900 text-sm mt-0.5">
              {user?.displayName || 'Krushna Borase'}
            </div>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60">
            <span className="text-slate-400">Email Address:</span>
            <div className="font-semibold text-slate-900 text-sm mt-0.5">
              {user?.email || 'parent@example.com'}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Stages Form */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-5">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Bell className="w-4 h-4 text-emerald-700" />
          <span>{t.settings.channelsTitle}</span>
        </div>

        <div className="space-y-3 text-xs sm:text-sm">
          {/* 7-Day */}
          <label className="flex items-center justify-between p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/70 cursor-pointer hover:bg-stone-50 transition-colors">
            <span className="font-medium text-slate-800">{t.settings.enableSevenDay}</span>
            <input
              type="checkbox"
              checked={localPrefs.enableSevenDay}
              onChange={(e) => setLocalPrefs({ ...localPrefs, enableSevenDay: e.target.checked })}
              className="w-4 h-4 accent-emerald-800 rounded"
            />
          </label>

          {/* 3-Day */}
          <label className="flex items-center justify-between p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/70 cursor-pointer hover:bg-stone-50 transition-colors">
            <span className="font-medium text-slate-800">{t.settings.enableThreeDay}</span>
            <input
              type="checkbox"
              checked={localPrefs.enableThreeDay}
              onChange={(e) => setLocalPrefs({ ...localPrefs, enableThreeDay: e.target.checked })}
              className="w-4 h-4 accent-emerald-800 rounded"
            />
          </label>

          {/* Same Day */}
          <label className="flex items-center justify-between p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/70 cursor-pointer hover:bg-stone-50 transition-colors">
            <span className="font-medium text-slate-800">{t.settings.enableSameDay}</span>
            <input
              type="checkbox"
              checked={localPrefs.enableSameDay}
              onChange={(e) => setLocalPrefs({ ...localPrefs, enableSameDay: e.target.checked })}
              className="w-4 h-4 accent-emerald-800 rounded"
            />
          </label>

          {/* Push */}
          <label className="flex items-center justify-between p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/70 cursor-pointer hover:bg-stone-50 transition-colors">
            <span className="font-medium text-slate-800">{t.settings.enablePush}</span>
            <input
              type="checkbox"
              checked={localPrefs.enablePush}
              onChange={(e) => setLocalPrefs({ ...localPrefs, enablePush: e.target.checked })}
              className="w-4 h-4 accent-emerald-800 rounded"
            />
          </label>
        </div>

        {/* Delivery Time & Language */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">
              {t.settings.deliveryTimeLabel}
            </label>
            <input
              type="time"
              value={localPrefs.preferredDeliveryTime}
              onChange={(e) => setLocalPrefs({ ...localPrefs, preferredDeliveryTime: e.target.value })}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">
              {t.settings.languageLabel}
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
            >
              <option value="en">English</option>
              <option value="mr">मराठी (Marathi)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-sm"
          >
            {t.settings.saveSettings}
          </button>
        </div>
      </div>

      {/* Data Export & Backup */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Download className="w-4 h-4 text-emerald-700" />
          <span>Data Portability & Backup</span>
        </div>
        <p className="text-xs text-slate-500">
          Export your family’s complete vaccination records, dates, growth logs, and symptom history as portable JSON.
        </p>

        <button
          onClick={exportData}
          className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors border border-stone-200"
        >
          <Download className="w-4 h-4" />
          <span>{t.settings.exportData}</span>
        </button>
      </div>
    </div>
  );
}
