'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { VACCINE_DEFINITIONS, calculateChildAge } from '@/lib/vaccine-data';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import {
  X,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  PhoneCall,
  Clock,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

interface OverdueCatchUpModalProps {
  vaccinationId: string | null;
  onClose: () => void;
  onOpenRecord: (vaxId: string) => void;
  onOpenReschedule: (vaxId: string) => void;
}

export function OverdueCatchUpModal({
  vaccinationId,
  onClose,
  onOpenRecord,
  onOpenReschedule,
}: OverdueCatchUpModalProps) {
  const { language, selectedChild, vaccinations } = useApp();
  const t = translations[language];

  if (!vaccinationId || !selectedChild) return null;

  const targetVax = vaccinations.find((v) => v.id === vaccinationId);
  if (!targetVax) return null;

  const vaxDef = VACCINE_DEFINITIONS[targetVax.vaccineId];
  const today = new Date();
  const daysOverdue = Math.max(0, differenceInCalendarDays(today, parseISO(targetVax.dueDate)));
  const childAge = calculateChildAge(selectedChild.dateOfBirth, language);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-800" />
            </div>
            <div>
              <h3 className="font-bold text-amber-950 text-base">
                {t.catchup.title}
              </h3>
              <p className="text-xs text-amber-900/80">
                {language === 'mr' ? vaxDef?.marathiName : vaxDef?.name} (Dose {targetVax.doseNumber})
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs sm:text-sm">
          {/* Overdue Status Banner */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                {selectedChild.name} · {childAge.formatted}
              </span>
              <div className="text-sm font-semibold text-amber-950 mt-0.5">
                Recommended Due Date: {targetVax.dueDate}
              </div>
            </div>
            <div className="px-3 py-1.5 bg-amber-200/80 text-amber-900 font-extrabold text-sm rounded-lg self-start sm:self-auto flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-800" />
              <span>{daysOverdue} {t.catchup.elapsedDays}</span>
            </div>
          </div>

          {/* Clinical Catch-up Guidance Rules (MoHFW Standards) */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>{t.catchup.subtitle}</span>
            </h4>

            {/* Rule 1: Do Not Restart */}
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <div className="font-bold text-slate-900 text-xs text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                <span>{t.catchup.ruleNoRestartTitle}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-5">
                {t.catchup.ruleNoRestartDesc}
              </p>
            </div>

            {/* Rule 2: Minimum Interval */}
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <div className="font-bold text-slate-900 text-xs text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                <span>{t.catchup.minIntervalRuleTitle}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-5">
                {t.catchup.minIntervalRuleDesc}
              </p>
            </div>

            {/* Rule 3: Age limits */}
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <div className="font-bold text-slate-900 text-xs text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                <span>{t.catchup.ageLimitTitle}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-5">
                {t.catchup.ageLimitDesc}
              </p>
            </div>
          </div>

          {/* Professional Review Notice */}
          <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 flex items-start gap-2.5 text-xs text-rose-950">
            <ShieldAlert className="w-4 h-4 text-rose-700 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-rose-900">{t.catchup.professionalReviewRequired}</strong>
              <p className="text-rose-900/90 text-[11px] mt-0.5 leading-relaxed">
                {language === 'mr'
                  ? 'बालरोगतज्ज्ञांशी किंवा प्राथमिक आरोग्य केंद्रातील (PHC) वैद्यकीय अधिकाऱ्यांशी संपर्क साधून प्रत्यक्ष सल्ला घ्या. हे ॲप परस्पर पुढील डोस बदलत नाही.'
                  : 'Vaccine schedules must not be arbitrarily adjusted without professional review. Please consult your pediatrician or primary health centre to safely administer the catch-up dose.'}
              </p>
            </div>
          </div>

          {/* Emergency Helpline Contacts */}
          <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80 text-xs text-emerald-950">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5 mb-2">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.helplines.title}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-1.5 bg-white rounded border border-emerald-200/60 font-semibold text-slate-800">
                {t.helplines.healthHelpline}
              </div>
              <div className="p-1.5 bg-white rounded border border-emerald-200/60 font-semibold text-slate-800">
                {t.helplines.ambulance}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex flex-wrap items-center justify-end gap-2">
          <button
            onClick={() => {
              onClose();
              onOpenReschedule(targetVax.id);
            }}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-stone-200 hover:bg-stone-300 rounded-xl transition-colors"
          >
            {t.catchup.rescheduleDueDate}
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenRecord(targetVax.id);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t.catchup.recordLateDose}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
