'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { VACCINE_DEFINITIONS } from '@/lib/vaccine-data';
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  List,
  Edit2,
  Filter,
} from 'lucide-react';
import { VaccinationStatus } from '@/lib/types';

interface CalendarViewProps {
  onOpenRecordModal: (vaccinationId: string) => void;
  onOpenEditDueDateModal: (vaccinationId: string) => void;
}

export function CalendarView({
  onOpenRecordModal,
  onOpenEditDueDateModal,
}: CalendarViewProps) {
  const { language, selectedChild, vaccinations, reminders } = useApp();
  const t = translations[language];

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('agenda');
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed' | 'overdue'>('all');
  const [selectedVaccinationId, setSelectedVaccinationId] = useState<string | null>(null);

  if (!selectedChild) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">{t.dashboard.noChildren}</p>
      </div>
    );
  }

  const childVaccinations = vaccinations.filter((v) => v.childId === selectedChild.id);

  // Filtered list
  const filteredVaccinations = childVaccinations.filter((v) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'completed') return v.status === 'completed';
    if (statusFilter === 'overdue') return v.status === 'overdue' || v.status === 'due_today';
    if (statusFilter === 'scheduled') return v.status === 'scheduled';
    return true;
  }).sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  // Calendar month days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Detail panel vaccination
  const detailVax = childVaccinations.find((v) => v.id === selectedVaccinationId);
  const detailDef = detailVax ? VACCINE_DEFINITIONS[detailVax.vaccineId] : null;
  const detailReminders = detailVax
    ? reminders.filter((r) => r.vaccinationId === detailVax.id)
    : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t.calendar.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t.calendar.subtitle} — {selectedChild.name}
          </p>
        </div>

        {/* View Mode & Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Segmented Controls */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              onClick={() => setViewMode('agenda')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'agenda' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>{t.calendar.viewAgenda}</span>
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'month' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>{t.calendar.viewMonth}</span>
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
            {(['all', 'scheduled', 'completed', 'overdue'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setStatusFilter(mode)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  statusFilter === mode ? 'bg-white text-emerald-900 font-semibold shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode === 'all' && t.calendar.filterAll}
                {mode === 'scheduled' && t.calendar.filterScheduled}
                {mode === 'completed' && t.calendar.filterCompleted}
                {mode === 'overdue' && t.calendar.filterOverdue}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Calendar View Area */}
      {viewMode === 'month' ? (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden p-5">
          {/* Month Navigator */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-1.5 text-slate-600 hover:bg-stone-100 rounded-lg transition-colors"
                aria-label="Previous Month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-stone-100 rounded-lg transition-colors"
              >
                {t.calendar.today}
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-1.5 text-slate-600 hover:bg-stone-100 rounded-lg transition-colors"
                aria-label="Next Month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-xs font-bold text-slate-400 py-1">
                {d}
              </div>
            ))}

            {monthDays.map((day) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const vaxesOnThisDay = childVaccinations.filter((v) => v.dueDate === dayStr);

              return (
                <div
                  key={dayStr}
                  className="min-h-[85px] sm:min-h-[100px] p-1.5 rounded-xl border border-stone-100 bg-stone-50/50 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${
                      isSameDay(day, new Date())
                        ? 'w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center'
                        : 'text-slate-700'
                    }`}>
                      {format(day, 'd')}
                    </span>
                  </div>

                  <div className="space-y-1 mt-1">
                    {vaxesOnThisDay.map((v) => {
                      const def = VACCINE_DEFINITIONS[v.vaccineId];
                      const isCompleted = v.status === 'completed';
                      const isOverdue = v.status === 'overdue';

                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVaccinationId(v.id)}
                          className={`w-full text-left p-1 rounded text-[10px] font-semibold truncate transition-colors ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-900'
                              : isOverdue
                              ? 'bg-amber-100 text-amber-900 font-bold'
                              : 'bg-stone-200 text-slate-800'
                          }`}
                        >
                          {def?.shortCode || v.vaccineId}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda List View */
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-stone-100">
            {filteredVaccinations.length === 0 ? (
              <div className="text-center py-12 text-sm text-slate-500">
                {t.dashboard.noUpcoming}
              </div>
            ) : (
              filteredVaccinations.map((vax) => {
                const def = VACCINE_DEFINITIONS[vax.vaccineId];
                const isCompleted = vax.status === 'completed';
                const isOverdue = vax.status === 'overdue';
                const isDueToday = vax.status === 'due_today';

                return (
                  <div
                    key={vax.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/60 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Status Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isOverdue
                          ? 'bg-amber-100 text-amber-900'
                          : isDueToday
                          ? 'bg-teal-100 text-teal-800 animate-pulse'
                          : 'bg-stone-100 text-slate-700'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                        ) : isOverdue ? (
                          <AlertCircle className="w-5 h-5 text-amber-700" />
                        ) : (
                          <Clock className="w-5 h-5 text-slate-600" />
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900">
                            {language === 'mr' ? def?.marathiName || def?.name : def?.name}
                          </h3>
                          <span className="text-xs text-slate-500">
                            ({language === 'mr' ? 'डोस' : 'Dose'} {vax.doseNumber})
                          </span>
                          <span className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded ${
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : isOverdue
                              ? 'bg-amber-50 text-amber-900 border border-amber-300'
                              : isDueToday
                              ? 'bg-teal-50 text-teal-900 border border-teal-200'
                              : 'bg-stone-100 text-slate-700'
                          }`}>
                            {vax.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-1 max-w-xl">
                          {language === 'mr' ? def?.marathiDiseasesPrevented : def?.diseasesPrevented}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                          <div>
                            <span className="text-slate-400">{t.calendar.recommendedDate}: </span>
                            <span className="font-semibold text-slate-800">{vax.dueDate}</span>
                          </div>

                          {vax.administeredDate && (
                            <>
                              <span className="text-slate-300">·</span>
                              <div className="text-emerald-800 font-medium">
                                <span>{t.calendar.actualDate}: </span>
                                <strong>{vax.administeredDate}</strong>
                              </div>
                            </>
                          )}

                          {vax.administeredFacility && (
                            <>
                              <span className="text-slate-300">·</span>
                              <span className="text-slate-500">{vax.administeredFacility}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => setSelectedVaccinationId(vax.id)}
                        className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                      >
                        {t.calendar.doseDetails}
                      </button>

                      {!isCompleted && (
                        <>
                          <button
                            onClick={() => onOpenEditDueDateModal(vax.id)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-stone-100 rounded-lg transition-colors"
                            title={t.calendar.editDueDate}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenRecordModal(vax.id)}
                            className="px-3 py-1.5 text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t.calendar.markDone}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Dose Detail Slide-Over / Modal */}
      {detailVax && detailDef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  {detailDef.shortCode} · Dose {detailVax.doseNumber}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {language === 'mr' ? detailDef.marathiName : detailDef.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedVaccinationId(null)}
                className="text-xs px-2.5 py-1 bg-stone-200 hover:bg-stone-300 rounded-lg text-slate-700 font-semibold"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">{t.library.diseasesPrevented}</h4>
                <p className="text-slate-600 leading-relaxed">
                  {language === 'mr' ? detailDef.marathiDiseasesPrevented : detailDef.diseasesPrevented}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-1">{t.library.routeAndSite}</h4>
                <p className="text-slate-600">
                  {language === 'mr' ? detailDef.marathiRouteAndSite : detailDef.routeAndSite}
                </p>
              </div>

              {/* 3-Stage Reminders Scheduled for this dose */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  {language === 'mr' ? '३-टप्प्यांची नियोजित स्मरणपत्रे' : '3-Stage Reminder Schedule'}
                </h4>
                {detailReminders.map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-xs py-1 border-b border-stone-200/50 last:border-b-0">
                    <span className="text-slate-600 font-medium">
                      {r.stage === 'seven_day' ? '7 Days Before' : r.stage === 'three_day' ? '3 Days Before' : 'Vaccination Day'}
                    </span>
                    <span className="font-mono text-slate-800">{r.triggerDate}</span>
                    <span className={`text-[11px] font-semibold ${
                      r.status === 'delivered' ? 'text-emerald-700' : r.status === 'cancelled' ? 'text-slate-400' : 'text-amber-700'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>

              {detailVax.status === 'completed' && (
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                  <div className="font-bold">{t.calendar.doseCompleted}</div>
                  <div className="mt-1 text-xs">Administered on: {detailVax.administeredDate}</div>
                  {detailVax.administeredFacility && (
                    <div className="text-xs">Facility: {detailVax.administeredFacility}</div>
                  )}
                  {detailVax.batchNumber && (
                    <div className="text-xs">Batch No: {detailVax.batchNumber}</div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
              {detailVax.status !== 'completed' ? (
                <>
                  <button
                    onClick={() => {
                      setSelectedVaccinationId(null);
                      onOpenEditDueDateModal(detailVax.id);
                    }}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900"
                  >
                    {t.calendar.editDueDate}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedVaccinationId(null);
                      onOpenRecordModal(detailVax.id);
                    }}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl shadow-sm"
                  >
                    {t.calendar.markDone}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSelectedVaccinationId(null)}
                  className="w-full py-2 bg-stone-200 text-slate-800 text-xs font-semibold rounded-xl"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
