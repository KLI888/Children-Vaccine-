'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { translations } from '@/lib/i18n';
import {
  Activity,
  Plus,
  AlertTriangle,
  Clock,
  Thermometer,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';

interface SymptomTrackerViewProps {
  onOpenAddSymptom: () => void;
}

export function SymptomTrackerView({ onOpenAddSymptom }: SymptomTrackerViewProps) {
  const { language, selectedChild, symptomRecords } = useApp();
  const t = translations[language];

  if (!selectedChild) {
    return (
      <div className="text-center py-12 text-sm text-slate-500">
        {t.dashboard.noChildren}
      </div>
    );
  }

  const childSymptoms = symptomRecords.filter((s) => s.childId === selectedChild.id);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t.symptoms.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t.symptoms.subtitle} — {selectedChild.name}
          </p>
        </div>

        <button
          onClick={onOpenAddSymptom}
          className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.symptoms.addEntry}</span>
        </button>
      </div>

      {/* Red-Flag Safety Box */}
      <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-5 flex items-start gap-3.5 shadow-sm">
        <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center flex-shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5 text-amber-800" />
        </div>
        <div className="flex-1 text-xs sm:text-sm">
          <h3 className="font-bold text-amber-950 mb-1">
            {language === 'mr' ? 'आरोग्य व तातडीचे सुरक्षा मार्गदर्शन' : 'Post-Vaccination Safety & Emergency Red Flags'}
          </h3>
          <p className="text-amber-900/90 leading-relaxed text-xs">
            {t.symptoms.safetyNotice}
          </p>
          <div className="mt-2.5 pt-2 border-t border-amber-200/80 text-[11px] text-amber-950/80 font-medium">
            {language === 'mr'
              ? 'टीप: हे ॲप औषध मात्रा सुचवत नाही. कोणतेही औषध देण्यापूर्वी अधिकृत डॉक्टरांचा सल्ला घ्या.'
              : 'Disclaimer: This application records parental observations and does not prescribe medicine or clinical dosages. Consult your pediatrician or hospital for medical care.'}
          </div>
        </div>
      </div>

      {/* Symptom Records List */}
      <div className="space-y-4">
        {childSymptoms.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
            <Activity className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">{t.symptoms.noEntries}</p>
          </div>
        ) : (
          childSymptoms.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    {entry.vaccineName || 'Post-Vaccination'}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Onset: {entry.onsetTimestamp.replace('T', ' ')}
                  </span>
                </div>

                {entry.consultedDoctor && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 self-start sm:self-auto">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Doctor Consulted</span>
                  </span>
                )}
              </div>

              {/* Temperature & duration */}
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-700 mb-3">
                {entry.temperatureF && (
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Thermometer className="w-4 h-4 text-amber-600" />
                    <span>{entry.temperatureF}°F ({entry.temperatureC}°C)</span>
                  </div>
                )}
                {entry.durationHours && (
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>Duration: {entry.durationHours} hours</span>
                  </div>
                )}
              </div>

              {/* Observed Symptoms */}
              {entry.symptomsObserved.length > 0 && (
                <div className="mb-3">
                  <span className="text-xs text-slate-400 font-semibold block mb-1">
                    {t.symptoms.symptomsObserved}:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.symptomsObserved.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 bg-stone-100 text-slate-700 rounded-lg border border-stone-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Taken & Notes */}
              {entry.actionTaken && (
                <div className="p-3 bg-stone-50 rounded-xl text-xs text-slate-700 border border-stone-200/60 mb-2">
                  <strong className="text-slate-900">Action Taken:</strong> {entry.actionTaken}
                </div>
              )}

              {entry.notes && (
                <p className="text-xs text-slate-500 italic">
                  Note: {entry.notes}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
