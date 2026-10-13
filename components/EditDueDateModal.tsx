'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { VACCINE_DEFINITIONS } from '@/lib/vaccine-data';
import { X, Calendar, RefreshCw } from 'lucide-react';

interface EditDueDateModalProps {
  vaccinationId: string | null;
  onClose: () => void;
}

export function EditDueDateModal({
  vaccinationId,
  onClose,
}: EditDueDateModalProps) {
  const { language, vaccinations, updateVaccinationDueDate } = useApp();
  const t = translations[language];

  const targetVax = vaccinations.find((v) => v.id === vaccinationId);
  const targetDef = targetVax ? VACCINE_DEFINITIONS[targetVax.vaccineId] : null;

  const [newDueDate, setNewDueDate] = useState<string>(targetVax?.dueDate || '');

  if (!targetVax) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDueDate) return;

    updateVaccinationDueDate(targetVax.id, newDueDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {t.calendar.editDueDate}
              </h3>
              <p className="text-xs text-slate-500">
                {targetDef?.name} (Dose {targetVax.doseNumber})
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t.calendar.recommendedDate} (Current: {targetVax.dueDate})
            </label>
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
              required
            />
          </div>

          <div className="p-3 bg-stone-50 rounded-xl text-[11px] text-slate-600 flex items-start gap-2 border border-stone-200/60">
            <RefreshCw className="w-4 h-4 text-emerald-800 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Updating this scheduled date will automatically recalculate the three reminder trigger dates (-7 days, -3 days, and Day 0) and update your pending notification queue.
            </p>
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
              Save New Date & Reschedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
