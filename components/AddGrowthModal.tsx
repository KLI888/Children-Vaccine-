'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { format } from 'date-fns';
import { X, TrendingUp, AlertCircle } from 'lucide-react';

interface AddGrowthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddGrowthModal({ isOpen, onClose }: AddGrowthModalProps) {
  const { language, selectedChild, addGrowthRecord } = useApp();
  const t = translations[language];

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const [date, setDate] = useState(todayStr);
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !selectedChild) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const wt = parseFloat(weightKg);
    if (isNaN(wt) || wt <= 0.5 || wt > 40) {
      setErrorMsg('Please enter a valid weight in kg (between 0.5 and 40 kg).');
      return;
    }

    const ht = heightCm ? parseFloat(heightCm) : undefined;
    if (ht !== undefined && (isNaN(ht) || ht < 30 || ht > 150)) {
      setErrorMsg('Please enter a valid height/length in cm (between 30 and 150 cm).');
      return;
    }

    addGrowthRecord({
      childId: selectedChild.id,
      measurementDate: date,
      weightKg: wt,
      heightCm: ht,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {t.growth.addTitle}
              </h3>
              <p className="text-xs text-slate-500">
                {selectedChild.name}
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

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs sm:text-sm">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t.growth.measurementDate} *
            </label>
            <input
              type="date"
              required
              max={todayStr}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.growth.weightKg} *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="e.g. 5.4"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.growth.heightCm}
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 58.5"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Notes (e.g. clinic visit, pediatric checkup)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Routine 3-month weight check"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-stone-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-colors shadow-sm"
            >
              Save Measurement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
