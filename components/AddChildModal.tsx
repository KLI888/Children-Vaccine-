'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { format, isAfter, parseISO } from 'date-fns';
import { X, Baby, AlertCircle } from 'lucide-react';

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddChildModal({ isOpen, onClose }: AddChildModalProps) {
  const { language, addChild } = useApp();
  const t = translations[language];

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [bloodGroup, setBloodGroup] = useState('');
  const [birthWeightKg, setBirthWeightKg] = useState('');
  const [birthHeightCm, setBirthHeightCm] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your child’s name.');
      return;
    }

    if (!dateOfBirth) {
      setErrorMsg('Please enter date of birth.');
      return;
    }

    // Validate DOB not in future
    if (dateOfBirth > todayStr) {
      setErrorMsg('Date of birth cannot be in the future.');
      return;
    }

    const weightNum = birthWeightKg ? parseFloat(birthWeightKg) : undefined;
    if (weightNum !== undefined && (weightNum <= 0.5 || weightNum > 15)) {
      setErrorMsg('Please enter a realistic birth weight (kg).');
      return;
    }

    const heightNum = birthHeightCm ? parseFloat(birthHeightCm) : undefined;
    if (heightNum !== undefined && (heightNum < 20 || heightNum > 100)) {
      setErrorMsg('Please enter a realistic birth length (cm).');
      return;
    }

    addChild({
      name: name.trim(),
      dateOfBirth,
      gender,
      bloodGroup: bloodGroup.trim() || undefined,
      birthWeightKg: weightNum,
      birthHeightCm: heightNum,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Baby className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {t.dashboard.addChild}
              </h3>
              <p className="text-xs text-slate-500">
                Generate personalized Indian UIP schedule
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs sm:text-sm">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t.children.nameLabel} *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Aarav, Ananya, Kabir"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.children.dobLabel} *
              </label>
              <input
                type="date"
                required
                max={todayStr}
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.children.genderLabel} *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
              >
                <option value="male">{t.children.male}</option>
                <option value="female">{t.children.female}</option>
                <option value="other">{t.children.other}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.children.bloodGroupLabel}
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-2.5 py-2 border border-stone-300 rounded-xl text-sm"
              >
                <option value="">Unknown</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Birth Wt (kg)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 3.2"
                value={birthWeightKg}
                onChange={(e) => setBirthWeightKg(e.target.value)}
                className="w-full px-2.5 py-2 border border-stone-300 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Length (cm)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 50"
                value={birthHeightCm}
                onChange={(e) => setBirthHeightCm(e.target.value)}
                className="w-full px-2.5 py-2 border border-stone-300 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t.children.notesLabel}
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Place of birth, known allergies, premature birth details"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
            />
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
              {t.children.saveChild}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
