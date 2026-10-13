'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { VACCINE_DEFINITIONS } from '@/lib/vaccine-data';
import {
  Bell,
  Sparkles,
  Volume2,
  Calendar,
  X,
  Play,
  CheckCircle2,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { ReminderStage } from '@/lib/types';

// Web Audio API synthesizer for an authentic notification chime
function playNotificationChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Note 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.3);

    // Note 2: B5 (987.77 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.frequency.setValueAtTime(987.77, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.6);
  } catch {
    // Ignore audio context block if user hasn't interacted
  }
}

interface ActiveSimulatedNotification {
  id: string;
  stage: ReminderStage;
  title: string;
  message: string;
  vaccineName: string;
  childName: string;
  date: string;
  timestamp: string;
}

export function ExaminerNotificationSimulator() {
  const {
    language,
    selectedChild,
    vaccinations,
    markReminderDelivered,
    triggerTestNotification,
  } = useApp();

  const t = translations[language];
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<ReminderStage>('same_day');
  const [activePopup, setActivePopup] = useState<ActiveSimulatedNotification | null>(null);

  const effectiveChildName = selectedChild?.name || 'Aarav Borase (Demo)';

  // Find next pending vaccine
  const pendingVax = (selectedChild && vaccinations.find((v) => v.childId === selectedChild.id && v.status !== 'completed')) || vaccinations[0];
  const vaxDef = pendingVax ? VACCINE_DEFINITIONS[pendingVax.vaccineId] : null;
  const vaxName = (language === 'mr' ? vaxDef?.marathiName : vaxDef?.name) || 'Pentavalent';

  const handleSimulate = () => {
    // 1. Play realistic chime
    playNotificationChime();

    // 2. Build stage-specific notification text
    let title = '';
    let message = '';
    let stageLabel = '';

    if (selectedStage === 'seven_day') {
      stageLabel = 'Stage 1 (-7 Days Before)';
      title = language === 'mr' ? 'पुढील आठवड्यात लसीकरण येत आहे' : 'Vaccination coming up next week';
      message = language === 'mr'
        ? `${effectiveChildName} चे ${vaxName} लसीकरण ७ दिवसांनी नियोजित आहे. कृपया आपल्या भेटीचे नियोजन करा.`
        : `${effectiveChildName}'s ${vaxName} vaccination is scheduled 7 days from now (${pendingVax?.dueDate || 'upcoming'}). Please plan your visit.`;
    } else if (selectedStage === 'three_day') {
      stageLabel = 'Stage 2 (-3 Days Before)';
      title = language === 'mr' ? '३ दिवसांत लसीकरण देय आहे' : 'Vaccination due in 3 days';
      message = language === 'mr'
        ? `${effectiveChildName} चे ${vaxName} लसीकरण ३ दिवसांत देय आहे. कृपया दवाखान्याची वेळ तपासा.`
        : `${effectiveChildName}'s ${vaxName} vaccination is due in 3 days. Please review plans and contact provider.`;
    } else {
      stageLabel = 'Stage 3 (Vaccination Day / Day 0)';
      title = language === 'mr' ? 'आज लसीकरण देय आहे' : 'Vaccination due today';
      message = language === 'mr'
        ? `${effectiveChildName} चे ${vaxName} लसीकरण आज नियोजित आहे. कृपया वेळेवर आरोग्य केंद्राला भेट द्या.`
        : `${effectiveChildName}'s ${vaxName} vaccination is scheduled for today. Please confirm appointment or consult PHC.`;
    }

    const newSim: ActiveSimulatedNotification = {
      id: `sim_${Date.now()}`,
      stage: selectedStage,
      title,
      message,
      vaccineName: vaxName,
      childName: effectiveChildName,
      date: pendingVax?.dueDate || 'Today',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setActivePopup(newSim);

    // Try real browser push as well
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
        });
      } catch {}
    }

    // Auto-dismiss popup after 8 seconds
    setTimeout(() => {
      setActivePopup((current) => (current?.id === newSim.id ? null : current));
    }, 8000);
  };

  return (
    <>
      {/* Floating Demonstration Trigger Bar */}
      <div className="fixed bottom-16 sm:bottom-6 right-4 z-40 animate-bounce duration-1000">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-bold text-xs sm:text-sm rounded-full shadow-2xl border-2 border-emerald-300 transition-all transform hover:scale-105"
        >
          <Sparkles className="w-4 h-4 text-emerald-200 animate-spin" />
          <span>{language === 'mr' ? '🎓 परीक्षक थेट सूचना चाचणी (Demo)' : '🎓 Examiner Demo: Test Live Notification'}</span>
        </button>
      </div>

      {/* Simulator Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-emerald-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {language === 'mr' ? 'थेट सूचना सिम्युलेटर (परीक्षक प्रात्यक्षिक)' : 'Live Notification Demonstration Simulator'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Show your teacher/examiner how reminders fire on notified days
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 text-xs sm:text-sm">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-slate-700">
                <span className="text-xs text-slate-400 block font-semibold">Active Demonstration Child:</span>
                <strong className="text-slate-900 text-sm">{effectiveChildName}</strong> · Next Vaccine: <strong className="text-emerald-800">{vaxName}</strong> (Due: {pendingVax?.dueDate || 'Upcoming'})
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-2">
                  Select Notified Day Stage to Simulate:
                </label>
                <div className="space-y-2">
                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedStage === 'seven_day' ? 'bg-emerald-50 border-emerald-400 font-semibold' : 'bg-stone-50 border-stone-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-800" />
                      <span>Stage 1: 7 Days Before Due Date (-7d)</span>
                    </div>
                    <input
                      type="radio"
                      name="stage"
                      checked={selectedStage === 'seven_day'}
                      onChange={() => setSelectedStage('seven_day')}
                      className="accent-emerald-800"
                    />
                  </label>

                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedStage === 'three_day' ? 'bg-amber-50 border-amber-400 font-semibold' : 'bg-stone-50 border-stone-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-800" />
                      <span>Stage 2: 3 Days Before Due Date (-3d)</span>
                    </div>
                    <input
                      type="radio"
                      name="stage"
                      checked={selectedStage === 'three_day'}
                      onChange={() => setSelectedStage('three_day')}
                      className="accent-emerald-800"
                    />
                  </label>

                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedStage === 'same_day' ? 'bg-teal-50 border-teal-400 font-semibold' : 'bg-stone-50 border-stone-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-800" />
                      <span>Stage 3: Day of Vaccination (Day 0 / Today!)</span>
                    </div>
                    <input
                      type="radio"
                      name="stage"
                      checked={selectedStage === 'same_day'}
                      onChange={() => setSelectedStage('same_day')}
                      className="accent-emerald-800"
                    />
                  </label>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-emerald-950 text-xs">
                <strong>Demonstration Details:</strong> Clicking the button below will trigger a real audio chime, display an authentic notification banner with exact child details, and simulate the exact alert a parent receives on that day.
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    handleSimulate();
                    setIsOpen(false);
                  }}
                  className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Fire Simulated Notification Now 🔔</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Realistic System Push Notification Toast / Banner (Top-Right) */}
      {activePopup && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border-2 border-emerald-400 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Children Vaccine Mentor · {activePopup.timestamp}
              </span>
            </div>
            <button
              onClick={() => setActivePopup(null)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="font-bold text-sm text-white mb-1">
            {activePopup.title}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            {activePopup.message}
          </p>

          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Chime Alert Played</span>
            </span>
            <span className="text-slate-400 font-mono">
              Due: {activePopup.date}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
