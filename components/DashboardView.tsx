'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { calculateChildAge, VACCINE_DEFINITIONS } from '@/lib/vaccine-data';
import { format, differenceInCalendarDays, parseISO } from 'date-fns';
import {
  Baby,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Plus,
  TrendingUp,
  Activity,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenRecordModal: (vaccinationId?: string) => void;
  onOpenAddChild: () => void;
  onOpenAddGrowth: () => void;
  onOpenAddSymptom: () => void;
  onOpenOverdueCatchUp: (vaccinationId: string) => void;
  onOpenPrintCard: () => void;
}

export function DashboardView({
  setActiveTab,
  onOpenRecordModal,
  onOpenAddChild,
  onOpenAddGrowth,
  onOpenAddSymptom,
  onOpenOverdueCatchUp,
  onOpenPrintCard,
}: DashboardViewProps) {
  const {
    user,
    language,
    childrenList,
    selectedChild,
    vaccinations,
    reminders,
    growthRecords,
  } = useApp();

  const t = translations[language];
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  // If no children in account
  if (!selectedChild || childrenList.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Baby className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {language === 'mr' ? 'आपले स्वागत आहे!' : 'Welcome to Children Vaccine Mentor'}
        </h2>
        <p className="text-slate-600 max-w-md mx-auto mb-6 text-sm">
          {t.dashboard.noChildren}
        </p>
        <button
          onClick={onOpenAddChild}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-medium rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t.dashboard.addChild}</span>
        </button>
      </div>
    );
  }

  // Child statistics
  const childVax = vaccinations.filter((v) => v.childId === selectedChild.id);
  const completedVax = childVax.filter((v) => v.status === 'completed');
  const overdueVax = childVax.filter((v) => v.status === 'overdue');
  const dueTodayVax = childVax.filter((v) => v.status === 'due_today');
  const pendingUpcomingVax = childVax
    .filter((v) => v.status === 'scheduled' || v.status === 'due_today')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const nextUpcoming = pendingUpcomingVax[0] || null;
  const nextVaccineDef = nextUpcoming ? VACCINE_DEFINITIONS[nextUpcoming.vaccineId] : null;

  // Countdown in days
  let countdownDays = 0;
  if (nextUpcoming) {
    countdownDays = differenceInCalendarDays(parseISO(nextUpcoming.dueDate), today);
  }

  const completionPercent = childVax.length > 0
    ? Math.round((completedVax.length / childVax.length) * 100)
    : 0;

  const ageData = calculateChildAge(selectedChild.dateOfBirth, language);

  // Latest growth record
  const childGrowth = growthRecords.filter((g) => g.childId === selectedChild.id);
  const latestGrowth = childGrowth[childGrowth.length - 1];

  // Pending 3-stage reminders for this child
  const childReminders = reminders.filter(
    (r) => r.childId === selectedChild.id && r.status === 'pending'
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Welcome header & child profile summary */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            <span>{t.dashboard.today}: {format(today, 'dd MMMM yyyy')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t.dashboard.greeting}, {user?.displayName || 'Parent'}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{selectedChild.name}</span>
            <span className="text-slate-300">·</span>
            <span>{t.children.ageLabel}: <strong className="text-emerald-800 font-semibold">{ageData.formatted}</strong></span>
            <span className="text-slate-300">·</span>
            <span>DOB: {selectedChild.dateOfBirth}</span>
            {selectedChild.bloodGroup && (
              <>
                <span className="text-slate-300">·</span>
                <span>Blood: <strong>{selectedChild.bloodGroup}</strong></span>
              </>
            )}
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
          <button
            onClick={() => onOpenRecordModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-all shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-100" />
            <span>{t.dashboard.recordVaccination}</span>
          </button>
          <button
            onClick={onOpenAddGrowth}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all border border-stone-200"
          >
            <TrendingUp className="w-4 h-4 text-slate-500" />
            <span>{t.dashboard.addMeasurement}</span>
          </button>
          <button
            onClick={onOpenAddSymptom}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all border border-stone-200"
          >
            <Activity className="w-4 h-4 text-slate-500" />
            <span>{t.dashboard.logSymptom}</span>
          </button>
          <button
            onClick={onOpenPrintCard}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all border border-emerald-200 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>{language === 'mr' ? 'ममता कार्ड (प्रिंट)' : 'MCP Card (Print)'}</span>
          </button>
        </div>
      </div>

      {/* Critical alerts banner (Overdue or Due Today) */}
      {overdueVax.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-amber-800" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm sm:text-base font-bold text-amber-950">
              {t.dashboard.overdueAlert} ({overdueVax.length}{' '}
              {language === 'mr' ? 'डोस' : 'doses'})
            </h3>
            <p className="text-xs sm:text-sm text-amber-900/90 mt-1 leading-relaxed">
              {t.dashboard.overdueSubtitle}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {overdueVax.slice(0, 3).map((v) => {
                const def = VACCINE_DEFINITIONS[v.vaccineId];
                return (
                  <button
                    key={v.id}
                    onClick={() => onOpenOverdueCatchUp(v.id)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-white text-amber-950 border border-amber-300 rounded-lg hover:bg-amber-100/50 transition-colors shadow-xs"
                    title="Click for clinical catch-up review"
                  >
                    <span>{language === 'mr' ? def?.marathiName || def?.name : def?.name}</span>
                    <span className="text-amber-700 font-mono text-[11px]">({v.dueDate})</span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-700" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Due Today Banner */}
      {dueTodayVax.length > 0 && (
        <div className="bg-teal-50 border border-teal-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-teal-200 text-teal-900 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Clock className="w-5 h-5 text-teal-800" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm sm:text-base font-bold text-teal-950">
              {t.dashboard.dueTodayAlert}
            </h3>
            <p className="text-xs sm:text-sm text-teal-900 mt-1">
              {dueTodayVax.map((v) => VACCINE_DEFINITIONS[v.vaccineId]?.name || v.vaccineId).join(', ')}
            </p>
            <div className="mt-3">
              <button
                onClick={() => onOpenRecordModal(dueTodayVax[0].id)}
                className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                {t.calendar.markDone}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Next upcoming vaccine */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <span>{t.dashboard.upcomingNext}</span>
              <Calendar className="w-4 h-4 text-emerald-700" />
            </div>
            {nextUpcoming ? (
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {language === 'mr'
                    ? nextVaccineDef?.marathiName || nextVaccineDef?.name
                    : nextVaccineDef?.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {language === 'mr' ? 'डोस' : 'Dose'} {nextUpcoming.doseNumber} · {nextUpcoming.dueDate}
                </p>
                <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200/70 flex items-baseline justify-between">
                  <span className="text-xs text-slate-600">{t.dashboard.countdown}:</span>
                  <span className={`text-xl font-extrabold ${countdownDays <= 3 ? 'text-amber-700' : 'text-emerald-800'}`}>
                    {countdownDays <= 0 ? 'Today' : `${countdownDays} ${language === 'mr' ? 'दिवस' : 'days'}`}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 mt-2">{t.dashboard.noUpcoming}</p>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">{t.dashboard.threeStageBadge}</span>
            <button
              onClick={() => setActiveTab('reminders')}
              className="text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-0.5"
            >
              <span>View</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Immunization progress */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <span>{t.dashboard.progressTitle}</span>
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">
                {completionPercent}%
              </span>
              <span className="text-xs text-slate-500">
                {completedVax.length} / {childVax.length} {t.dashboard.completedOf}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2.5 bg-stone-100 rounded-full mt-3 overflow-hidden border border-stone-200/50">
              <div
                className="h-full bg-emerald-700 rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">UIP India (0–5 Years)</span>
            <button
              onClick={() => setActiveTab('calendar')}
              className="text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-0.5"
            >
              <span>{t.dashboard.viewAllCalendar}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 3: Growth & development status */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <span>{t.growth.title}</span>
              <TrendingUp className="w-4 h-4 text-emerald-700" />
            </div>
            {latestGrowth ? (
              <div className="space-y-2 mt-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">{t.growth.latestWeight}:</span>
                  <span className="text-2xl font-bold text-slate-900">
                    {latestGrowth.weightKg} kg
                  </span>
                </div>
                {latestGrowth.heightCm && (
                  <div className="flex items-baseline justify-between text-xs text-slate-600">
                    <span>{t.growth.heightCm}:</span>
                    <span className="font-semibold">{latestGrowth.heightCm} cm</span>
                  </div>
                )}
                <div className="text-[11px] text-slate-400">
                  {language === 'mr' ? 'शेवटचे मोजमाप' : 'Last measured'}: {latestGrowth.measurementDate}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 mt-2">{t.growth.noRecords}</p>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">WHO 2006 Standard</span>
            <button
              onClick={() => setActiveTab('growth')}
              className="text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-0.5"
            >
              <span>View Charts</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Vaccination Timeline list */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {t.dashboard.upcomingDoses}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'mr'
                ? 'नजीकच्या काळात देय असणाऱ्या लसींची यादी'
                : 'Timeline of eligible upcoming vaccine doses for this child'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('calendar')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
          >
            <span>{t.dashboard.viewAllCalendar}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-stone-100">
          {pendingUpcomingVax.slice(0, 5).map((vax) => {
            const def = VACCINE_DEFINITIONS[vax.vaccineId];
            const isDueToday = vax.status === 'due_today';

            return (
              <div
                key={vax.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/50 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isDueToday ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-emerald-50 text-emerald-800 font-bold text-xs'
                  }`}>
                    {def?.shortCode || 'VAX'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        {language === 'mr' ? def?.marathiName || def?.name : def?.name}
                      </h4>
                      <span className="text-xs text-slate-500 font-normal">
                        ({language === 'mr' ? 'डोस' : 'Dose'} {vax.doseNumber})
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                      {language === 'mr' ? def?.marathiDiseasesPrevented : def?.diseasesPrevented}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-600 mt-1.5">
                      <span className="font-semibold text-slate-800">
                        {t.calendar.recommendedDate}: {vax.dueDate}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-emerald-700 font-medium text-[11px]">
                        {def?.routeAndSite}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => onOpenRecordModal(vax.id)}
                    className="px-3 py-1.5 text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t.calendar.markDone}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
