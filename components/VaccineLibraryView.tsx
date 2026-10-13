'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { VACCINE_DEFINITIONS } from '@/lib/vaccine-data';
import {
  BookOpen,
  Search,
  AlertTriangle,
  CheckCircle,
  Syringe,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { VaccineCategory } from '@/lib/types';

export function VaccineLibraryView() {
  const { language } = useApp();
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | VaccineCategory>('all');

  const allVaccines = Object.values(VACCINE_DEFINITIONS);

  const filteredVaccines = allVaccines.filter((vax) => {
    // Category match
    if (selectedCategory !== 'all' && vax.category !== selectedCategory) {
      return false;
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = vax.name.toLowerCase().includes(q);
      const matchMrName = vax.marathiName.toLowerCase().includes(q);
      const matchCode = vax.shortCode.toLowerCase().includes(q);
      const matchDiseases = vax.diseasesPrevented.toLowerCase().includes(q);
      const matchMrDiseases = vax.marathiDiseasesPrevented.toLowerCase().includes(q);
      return matchName || matchMrName || matchCode || matchDiseases || matchMrDiseases;
    }

    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Medically Reviewed Information</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t.library.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t.library.subtitle}
          </p>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.library.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 bg-stone-50/50"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              selectedCategory === 'all'
                ? 'bg-emerald-800 text-white font-semibold shadow-sm'
                : 'bg-stone-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.library.categoryAll} ({allVaccines.length})
          </button>
          <button
            onClick={() => setSelectedCategory('uip_mandatory')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              selectedCategory === 'uip_mandatory'
                ? 'bg-emerald-800 text-white font-semibold shadow-sm'
                : 'bg-stone-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.library.categoryUip}
          </button>
          <button
            onClick={() => setSelectedCategory('iap_optional')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              selectedCategory === 'iap_optional'
                ? 'bg-emerald-800 text-white font-semibold shadow-sm'
                : 'bg-stone-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.library.categoryIap}
          </button>
        </div>
      </div>

      {/* Vaccine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredVaccines.map((vax) => (
          <div
            key={vax.id}
            className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm flex flex-col justify-between hover:border-emerald-200 transition-colors"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wider">
                    {vax.shortCode} · {vax.category === 'iap_optional' ? 'IAP Optional' : 'UIP National'}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                    {language === 'mr' ? vax.marathiName : vax.name}
                  </h3>
                </div>
              </div>

              {/* Diseases protected */}
              <div className="mt-2 p-3 bg-stone-50 rounded-xl text-xs text-slate-700 border border-stone-100">
                <span className="font-semibold text-slate-900 block mb-0.5">
                  {t.library.diseasesPrevented}:
                </span>
                <span>{language === 'mr' ? vax.marathiDiseasesPrevented : vax.diseasesPrevented}</span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                {language === 'mr' ? vax.marathiDescription : vax.description}
              </p>

              {/* Route & site */}
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                <Syringe className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                <span>
                  <strong>Route:</strong> {language === 'mr' ? vax.marathiRouteAndSite : vax.routeAndSite}
                </span>
              </div>

              {/* Mild reactions */}
              <div className="mt-4">
                <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 mb-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.library.commonReactions}</span>
                </h4>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside pl-1">
                  {(language === 'mr' ? vax.marathiCommonReactions : vax.commonReactions).map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* Warning signs */}
              <div className="mt-3">
                <h4 className="text-xs font-semibold text-amber-900 flex items-center gap-1.5 mb-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t.library.warningSigns}</span>
                </h4>
                <ul className="text-xs text-amber-950/80 space-y-1 list-disc list-inside pl-1 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200">
                  {(language === 'mr' ? vax.marathiWarningSigns : vax.warningSigns).map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Source Reference Footer */}
            <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate max-w-[240px]">{vax.sourceRef}</span>
              <span>Reviewed: {vax.lastReviewed}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Educational Disclaimer */}
      <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-xs text-slate-600 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-800 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          {t.library.disclaimer}
        </p>
      </div>
    </div>
  );
}
