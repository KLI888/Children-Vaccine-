'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { VACCINE_DEFINITIONS } from '@/lib/vaccine-data';
import { format } from 'date-fns';
import { X, Activity, Thermometer, ShieldAlert } from 'lucide-react';

interface AddSymptomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddSymptomModal({ isOpen, onClose }: AddSymptomModalProps) {
  const { language, selectedChild, vaccinations, addSymptomRecord } = useApp();
  const t = translations[language];

  const nowStr = format(new Date(), "yyyy-MM-dd'T'HH:mm");

  const [onset, setOnset] = useState(nowStr);
  const [selectedVaxId, setSelectedVaxId] = useState('');
  const [tempF, setTempF] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [durationHours, setDurationHours] = useState('24');
  const [actionTaken, setActionTaken] = useState('');
  const [consultedDoctor, setConsultedDoctor] = useState(false);
  const [notes, setNotes] = useState('');

  if (!isOpen || !selectedChild) return null;

  const childVax = vaccinations.filter((v) => v.childId === selectedChild.id);

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tf = tempF ? parseFloat(tempF) : undefined;
    let tc: number | undefined;
    if (tf) {
      tc = parseFloat((((tf - 32) * 5) / 9).toFixed(1));
    }

    addSymptomRecord({
      childId: selectedChild.id,
      vaccinationId: selectedVaxId || undefined,
      onsetTimestamp: onset,
      temperatureF: tf,
      temperatureC: tc,
      symptomsObserved: selectedSymptoms,
      durationHours: durationHours ? parseInt(durationHours, 10) : undefined,
      actionTaken: actionTaken.trim() || undefined,
      consultedDoctor,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {t.symptoms.addEntry}
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

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs sm:text-sm">
          {/* Related vaccine */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Related Vaccination (If known)
            </label>
            <select
              value={selectedVaxId}
              onChange={(e) => setSelectedVaxId(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
            >
              <option value="">None / General Observation</option>
              {childVax.map((v) => {
                const def = VACCINE_DEFINITIONS[v.vaccineId];
                return (
                  <option key={v.id} value={v.id}>
                    {def?.name || v.vaccineId} (Dose {v.doseNumber})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.symptoms.onsetLabel} *
              </label>
              <input
                type="datetime-local"
                required
                value={onset}
                onChange={(e) => setOnset(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.symptoms.tempF}
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 100.4"
                value={tempF}
                onChange={(e) => setTempF(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Symptoms Checklist */}
          <div>
            <label className="block font-semibold text-slate-700 mb-2">
              {t.symptoms.symptomsObserved}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {t.symptoms.symptomOptions.map((sym) => {
                const isChecked = selectedSymptoms.includes(sym);
                return (
                  <label
                    key={sym}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                        : 'bg-stone-50 border-stone-200 text-slate-700 hover:bg-stone-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSymptom(sym)}
                      className="w-3.5 h-3.5 accent-emerald-800 rounded"
                    />
                    <span className="truncate">{sym}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t.symptoms.durationHours}
            </label>
            <input
              type="number"
              placeholder="e.g. 24"
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
            />
          </div>

          {/* Action Taken */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t.symptoms.actionTaken}
            </label>
            <input
              type="text"
              placeholder="e.g. Prescribed paracetamol drops, damp cloth, rested"
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
            />
          </div>

          {/* Consulted Doctor checkbox */}
          <label className="flex items-center gap-2.5 p-3 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
            <input
              type="checkbox"
              checked={consultedDoctor}
              onChange={(e) => setConsultedDoctor(e.target.checked)}
              className="w-4 h-4 accent-emerald-800 rounded"
            />
            <span className="font-semibold text-slate-800">{t.symptoms.consultedDoctor}</span>
          </label>

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
              {t.symptoms.saveLog}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
