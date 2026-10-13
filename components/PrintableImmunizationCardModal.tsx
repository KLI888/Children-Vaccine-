'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { VACCINE_DEFINITIONS, calculateChildAge } from '@/lib/vaccine-data';
import { X, Printer, ShieldCheck, Download } from 'lucide-react';

interface PrintableImmunizationCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrintableImmunizationCardModal({
  isOpen,
  onClose,
}: PrintableImmunizationCardModalProps) {
  const { user, language, selectedChild, vaccinations } = useApp();
  const t = translations[language];

  if (!isOpen || !selectedChild) return null;

  const childVax = vaccinations
    .filter((v) => v.childId === selectedChild.id)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const childAge = calculateChildAge(selectedChild.dateOfBirth, language);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200 print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden print:shadow-none print:border-none print:max-h-none print:w-full">
        {/* Modal Controls (Hidden in Print) */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-800" />
            <span className="font-bold text-slate-900 text-sm">
              {t.mcpCard.title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>{t.mcpCard.printBtn}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Container */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 print:overflow-visible print:p-4 text-slate-900">
          {/* Card Official Header */}
          <div className="text-center border-b-2 border-emerald-800 pb-4">
            <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-900 font-bold text-xs uppercase tracking-widest rounded mb-1 border border-emerald-200">
              National Health Mission · MoHFW India
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              {language === 'mr'
                ? 'माता व बाल संरक्षण कार्ड (ममता कार्ड) — लसीकरण नोंदवही'
                : 'Mother & Child Protection (MCP) Card — Immunization Record'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Government of Maharashtra & Universal Immunization Programme (UIP) India
            </p>
          </div>

          {/* Child & Parent Metadata Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-stone-50 rounded-xl border border-stone-300 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">
                Child’s Name / नाव:
              </span>
              <strong className="text-slate-900 text-sm">{selectedChild.name}</strong>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">
                Date of Birth / जन्मतारीख:
              </span>
              <strong className="text-slate-900">{selectedChild.dateOfBirth}</strong>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">
                Sex & Blood Group / लिंग:
              </span>
              <strong className="text-slate-900">
                {selectedChild.gender.toUpperCase()} · {selectedChild.bloodGroup || 'N/A'}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">
                Parent / पालक:
              </span>
              <strong className="text-slate-900">{user?.displayName || 'Krushna Borase'}</strong>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">
                Birth Weight / जन्मावेळचे वजन:
              </span>
              <strong className="text-slate-900">
                {selectedChild.birthWeightKg ? `${selectedChild.birthWeightKg} kg` : 'N/A'}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">
                Current Age / सध्याचे वय:
              </span>
              <strong className="text-emerald-800">{childAge.formatted}</strong>
            </div>

            <div className="col-span-2">
              <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">
                Health ID / Record Key:
              </span>
              <span className="font-mono text-slate-700">{selectedChild.id}</span>
            </div>
          </div>

          {/* Complete Immunization Table */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-2">
              {t.mcpCard.immunizationTable}
            </h3>
            <div className="border border-stone-300 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-stone-100 text-slate-700 font-bold border-b border-stone-300">
                  <tr>
                    <th className="p-2.5 border-r border-stone-300">Vaccine Antigen / लस</th>
                    <th className="p-2.5 border-r border-stone-300 w-16">Dose</th>
                    <th className="p-2.5 border-r border-stone-300 w-28">{t.calendar.recommendedDate}</th>
                    <th className="p-2.5 border-r border-stone-300 w-28">{t.mcpCard.doseGivenDate}</th>
                    <th className="p-2.5 border-r border-stone-300">{t.mcpCard.facilityStamp}</th>
                    <th className="p-2.5 border-r border-stone-300 w-24">{t.mcpCard.batchNo}</th>
                    <th className="p-2.5 w-24">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {childVax.map((v) => {
                    const def = VACCINE_DEFINITIONS[v.vaccineId];
                    const isCompleted = v.status === 'completed';

                    return (
                      <tr key={v.id} className={isCompleted ? 'bg-emerald-50/20' : ''}>
                        <td className="p-2.5 border-r border-stone-200">
                          <strong className="text-slate-900 block">
                            {language === 'mr' ? def?.marathiName || def?.name : def?.name}
                          </strong>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {def?.shortCode} · {def?.routeAndSite}
                          </span>
                        </td>
                        <td className="p-2.5 border-r border-stone-200 font-semibold text-center">
                          {v.doseNumber}
                        </td>
                        <td className="p-2.5 border-r border-stone-200 font-mono text-slate-700">
                          {v.dueDate}
                        </td>
                        <td className="p-2.5 border-r border-stone-200 font-mono font-bold text-emerald-900">
                          {v.administeredDate || '—'}
                        </td>
                        <td className="p-2.5 border-r border-stone-200 text-slate-700">
                          {v.administeredFacility || (isCompleted ? 'Primary Health Centre' : '—')}
                        </td>
                        <td className="p-2.5 border-r border-stone-200 font-mono text-slate-600">
                          {v.batchNumber || (isCompleted ? 'VERIFIED' : '—')}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            isCompleted ? 'bg-emerald-100 text-emerald-900' : 'bg-stone-100 text-slate-500'
                          }`}>
                            {isCompleted ? 'Given' : 'Due'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Verification Stamps and Signatures section */}
          <div className="pt-6 border-t border-stone-200 grid grid-cols-2 gap-8 text-xs">
            <div className="border border-dashed border-stone-300 p-4 rounded-xl text-center">
              <div className="h-12 flex items-center justify-center text-stone-400 font-serif italic text-xs">
                [ Health Sub-Centre / Anganwadi Official Seal ]
              </div>
              <span className="text-slate-500 text-[11px] font-semibold block border-t border-stone-200 pt-1">
                Primary Health Centre / Hospital Seal
              </span>
            </div>

            <div className="border border-dashed border-stone-300 p-4 rounded-xl text-center">
              <div className="h-12 flex items-center justify-center text-stone-400 font-serif italic text-xs">
                [ Medical Officer / ANM / Pediatrician ]
              </div>
              <span className="text-slate-500 text-[11px] font-semibold block border-t border-stone-200 pt-1">
                {t.mcpCard.doctorSignature}
              </span>
            </div>
          </div>

          {/* Legal / Healthcare Disclaimer */}
          <div className="text-[10px] text-slate-400 text-center leading-relaxed">
            {t.mcpCard.certifiedNotice} {t.app.disclaimer}
          </div>
        </div>
      </div>
    </div>
  );
}
