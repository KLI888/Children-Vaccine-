'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { VACCINE_DEFINITIONS } from '@/lib/vaccine-data';
import { format } from 'date-fns';
import { X, CheckCircle2, ShieldCheck, Building2 } from 'lucide-react';

interface RecordVaccinationModalProps {
  vaccinationId: string | null;
  onClose: () => void;
}

export function RecordVaccinationModal({
  vaccinationId,
  onClose,
}: RecordVaccinationModalProps) {
  const { language, vaccinations, recordVaccination } = useApp();
  const t = translations[language];

  const targetVax = vaccinations.find((v) => v.id === vaccinationId) || vaccinations.find((v) => v.status !== 'completed');
  const targetDef = targetVax ? VACCINE_DEFINITIONS[targetVax.vaccineId] : null;

  const [selectedVaxId, setSelectedVaxId] = useState<string>(targetVax?.id || '');
  const [administeredDate, setAdministeredDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [facility, setFacility] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [notes, setNotes] = useState('');

  if (!vaccinationId && !targetVax) return null;

  const activeVax = vaccinations.find((v) => v.id === selectedVaxId) || targetVax;
  const activeDef = activeVax ? VACCINE_DEFINITIONS[activeVax.vaccineId] : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVax) return;

    recordVaccination(activeVax.id, {
      administeredDate,
      administeredFacility: facility.trim() || undefined,
      batchNumber: batchNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  const pendingDoses = vaccinations.filter((v) => v.status !== 'completed');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {t.calendar.markDone}
              </h3>
              <p className="text-xs text-slate-500">
                {t.calendar.actualDate}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Select Dose if not pre-locked */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Vaccine Dose
            </label>
            <select
              value={selectedVaxId}
              onChange={(e) => setSelectedVaxId(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
              required
            >
              {pendingDoses.map((v) => {
                const def = VACCINE_DEFINITIONS[v.vaccineId];
                return (
                  <option key={v.id} value={v.id}>
                    {def?.name || v.vaccineId} (Dose {v.doseNumber}) — Due: {v.dueDate}
                  </option>
                );
              })}
            </select>
          </div>

          {activeDef && (
            <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-900 border border-emerald-100">
              <div className="font-bold">{activeDef.name} ({activeDef.shortCode})</div>
              <div className="mt-0.5 text-emerald-800">{activeDef.routeAndSite}</div>
            </div>
          )}

          {/* Administered Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.calendar.actualDate} *
            </label>
            <input
              type="date"
              max={format(new Date(), 'yyyy-MM-dd')}
              value={administeredDate}
              onChange={(e) => setAdministeredDate(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
              required
            />
          </div>

          {/* Facility / PHC / Clinic */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.calendar.clinicOrHospital}
            </label>
            <input
              type="text"
              placeholder="e.g. Primary Health Centre (PHC), Civil Hospital, or Pediatric Clinic"
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
            />
          </div>

          {/* Batch Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.calendar.batchNumber}
            </label>
            <input
              type="text"
              placeholder="e.g. BCG-2481A or leave blank"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.calendar.parentNotes}
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Given without any difficulty, child weighed 4.8kg"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
            />
          </div>

          <div className="p-3 bg-stone-50 rounded-xl text-[11px] text-slate-500">
            <strong>Rule:</strong> Marking this dose as completed will automatically cancel all future pending reminders for this vaccine dose.
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
              {t.calendar.saveRecord}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
