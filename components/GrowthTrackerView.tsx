'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { WHO_GROWTH_STANDARDS } from '@/lib/growth-standards';
import {
  TrendingUp,
  Plus,
  Trash2,
  AlertCircle,
  Scale,
  Ruler,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { differenceInMonths, parseISO } from 'date-fns';

interface GrowthTrackerViewProps {
  onOpenAddGrowth: () => void;
}

export function GrowthTrackerView({ onOpenAddGrowth }: GrowthTrackerViewProps) {
  const { language, selectedChild, growthRecords, deleteGrowthRecord } = useApp();
  const t = translations[language];

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [chartMetric, setChartMetric] = useState<'weight' | 'height'>('weight');

  if (!selectedChild) {
    return (
      <div className="text-center py-12 text-sm text-slate-500">
        {t.dashboard.noChildren}
      </div>
    );
  }

  const childRecords = growthRecords
    .filter((g) => g.childId === selectedChild.id)
    .sort((a, b) => a.measurementDate.localeCompare(b.measurementDate));

  const latestRecord = childRecords[childRecords.length - 1];
  const previousRecord = childRecords[childRecords.length - 2];

  let weightChange = 0;
  if (latestRecord && previousRecord) {
    weightChange = parseFloat((latestRecord.weightKg - previousRecord.weightKg).toFixed(2));
  }

  // Build chart dataset combining WHO standards with child measurements
  const chartData = childRecords.map((r) => {
    const monthsFromBirth = Math.max(
      0,
      differenceInMonths(parseISO(r.measurementDate), parseISO(selectedChild.dateOfBirth))
    );

    // Find nearest WHO standard reference
    const nearestWho = WHO_GROWTH_STANDARDS.reduce((prev, curr) =>
      Math.abs(curr.month - monthsFromBirth) < Math.abs(prev.month - monthsFromBirth) ? curr : prev
    );

    const isBoy = selectedChild.gender !== 'female';
    const whoWeightMedian = isBoy ? nearestWho.boysWeightMedian : nearestWho.girlsWeightMedian;
    const whoHeightMedian = isBoy ? nearestWho.boysHeightMedian : nearestWho.girlsHeightMedian;

    return {
      date: r.measurementDate,
      month: `${monthsFromBirth}m`,
      weight: r.weightKg,
      height: r.heightCm || undefined,
      whoWeightMedian,
      whoHeightMedian,
    };
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t.growth.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t.growth.subtitle} — {selectedChild.name}
          </p>
        </div>

        <button
          onClick={onOpenAddGrowth}
          className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.growth.addTitle}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>{t.growth.latestWeight}</span>
            <Scale className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {latestRecord ? `${latestRecord.weightKg} kg` : '—'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {latestRecord ? `${latestRecord.measurementDate}` : 'No entry'}
          </p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>{t.growth.previousWeight}</span>
            <Scale className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {previousRecord ? `${previousRecord.weightKg} kg` : '—'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {previousRecord ? `${previousRecord.measurementDate}` : 'Initial baseline'}
          </p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>{t.growth.weightGain}</span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <div className={`text-2xl font-bold ${weightChange >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            {latestRecord && previousRecord ? `${weightChange > 0 ? '+' : ''}${weightChange} kg` : '—'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {latestRecord && previousRecord ? 'Since last visit' : 'Awaiting 2nd record'}
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {chartMetric === 'weight'
                ? (language === 'mr' ? 'वजन वाढ व WHO संदर्भ आलेख' : 'Weight-for-Age (WHO 2006 Standards)')
                : (language === 'mr' ? 'उंची वाढ व WHO संदर्भ आलेख' : 'Height/Length-for-Age (WHO 2006 Standards)')}
            </h2>
            <p className="text-xs text-slate-500">
              {chartMetric === 'weight'
                ? (language === 'mr'
                    ? 'हिरवी रेषा: बाळाचे वजन (kg) · राखाडी रेषा: WHO सरासरी (Median)'
                    : 'Green Line: Child Weight (kg) · Dashed Gray: WHO Median (50th percentile)')
                : (language === 'mr'
                    ? 'निळी रेषा: बाळाची उंची (cm) · राखाडी रेषा: WHO सरासरी (Median)'
                    : 'Blue Line: Child Height (cm) · Dashed Gray: WHO Median (50th percentile)')}
            </p>
          </div>

          {/* Metric Toggle Tabs */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl self-start sm:self-auto border border-stone-200">
            <button
              onClick={() => setChartMetric('weight')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                chartMetric === 'weight' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'mr' ? 'वजन (kg)' : 'Weight (kg)'}
            </button>
            <button
              onClick={() => setChartMetric('height')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                chartMetric === 'height' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'mr' ? 'उंची (cm)' : 'Height (cm)'}
            </button>
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  unit={chartMetric === 'weight' ? 'kg' : 'cm'}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  domain={['dataMin - 1', 'dataMax + 2']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                {chartMetric === 'weight' ? (
                  <>
                    <Line
                      type="monotone"
                      dataKey="weight"
                      name={`${selectedChild.name}'s Weight (kg)`}
                      stroke="#047857"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#047857' }}
                      activeDot={{ r: 7 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="whoWeightMedian"
                      name="WHO Weight Median"
                      stroke="#94a3b8"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      dot={false}
                    />
                  </>
                ) : (
                  <>
                    <Line
                      type="monotone"
                      dataKey="height"
                      name={`${selectedChild.name}'s Height (cm)`}
                      stroke="#0284c7"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#0284c7' }}
                      activeDot={{ r: 7 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="whoHeightMedian"
                      name="WHO Height Median"
                      stroke="#94a3b8"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      dot={false}
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500">
            {t.growth.noRecords}
          </div>
        )}

        {/* WHO growth standard disclaimer */}
        <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200/70 text-xs text-slate-600 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-800 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            {t.growth.whoNotice}
          </p>
        </div>
      </div>

      {/* Measurement History Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            {t.growth.history}
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {childRecords.length} records
          </span>
        </div>

        <div className="divide-y divide-stone-100">
          {childRecords.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              {t.growth.noRecords}
            </div>
          ) : (
            childRecords.map((item) => (
              <div
                key={item.id}
                className="p-4 flex items-center justify-between hover:bg-stone-50/60 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 text-sm">
                      {item.weightKg} kg
                    </span>
                    {item.heightCm && (
                      <span className="text-xs text-slate-600">
                        ({item.heightCm} cm length/height)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Measured on: <strong>{item.measurementDate}</strong>
                    {item.notes && <span className="text-slate-400"> · {item.notes}</span>}
                  </div>
                </div>

                <button
                  onClick={() => setDeleteConfirmId(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Record Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-center">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Delete Growth Record?</h3>
            <p className="text-xs text-slate-600 mb-5">
              Are you sure you want to remove this measurement from the growth history?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-stone-100 hover:bg-stone-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteGrowthRecord(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
