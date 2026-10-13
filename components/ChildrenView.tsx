'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { calculateChildAge } from '@/lib/vaccine-data';
import { format, isAfter, parseISO } from 'date-fns';
import {
  Baby,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  ShieldCheck,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Child } from '@/lib/types';

interface ChildrenViewProps {
  onOpenAddChild: () => void;
}

export function ChildrenView({ onOpenAddChild }: ChildrenViewProps) {
  const {
    language,
    childrenList,
    selectedChildId,
    setSelectedChildId,
    deleteChild,
    updateChild,
    vaccinations,
  } = useApp();

  const t = translations[language];

  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t.children.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t.children.subtitle}
          </p>
        </div>

        <button
          onClick={onOpenAddChild}
          className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.dashboard.addChild}</span>
        </button>
      </div>

      {/* Children list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {childrenList.map((child) => {
          const age = calculateChildAge(child.dateOfBirth, language);
          const isSelected = child.id === selectedChildId;
          const childVaxCount = vaccinations.filter((v) => v.childId === child.id).length;
          const completedVaxCount = vaccinations.filter(
            (v) => v.childId === child.id && v.status === 'completed'
          ).length;

          return (
            <div
              key={child.id}
              className={`bg-white rounded-2xl p-5 border transition-all ${
                isSelected
                  ? 'border-emerald-600 ring-2 ring-emerald-600/10 shadow-md'
                  : 'border-stone-200 shadow-sm hover:border-stone-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-lg">
                    {child.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {child.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{child.gender === 'male' ? t.children.male : t.children.female}</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-semibold text-emerald-800">{age.formatted}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingChild(child)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-stone-100 rounded-lg transition-colors"
                    title={t.children.editChild}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(child.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title={t.children.deleteChild}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-stone-50 rounded-xl text-xs text-slate-600 mb-4">
                <div>
                  <span className="text-slate-400">{t.children.dobLabel}:</span>
                  <div className="font-semibold text-slate-800">{child.dateOfBirth}</div>
                </div>
                <div>
                  <span className="text-slate-400">{t.children.bloodGroupLabel}:</span>
                  <div className="font-semibold text-slate-800">{child.bloodGroup || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-slate-400">{t.children.birthWeightLabel}:</span>
                  <div className="font-semibold text-slate-800">{child.birthWeightKg ? `${child.birthWeightKg} kg` : 'N/A'}</div>
                </div>
                <div>
                  <span className="text-slate-400">{t.children.birthHeightLabel}:</span>
                  <div className="font-semibold text-slate-800">{child.birthHeightCm ? `${child.birthHeightCm} cm` : 'N/A'}</div>
                </div>
              </div>

              {child.notes && (
                <p className="text-xs text-slate-500 mb-4 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                  <strong>Notes:</strong> {child.notes}
                </p>
              )}

              {/* Footer selection button */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {completedVaxCount} / {childVaxCount} {t.dashboard.completedOf}
                </span>

                {isSelected ? (
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    <span>{language === 'mr' ? 'सक्रिय निवड' : 'Active Profile'}</span>
                  </span>
                ) : (
                  <button
                    onClick={() => setSelectedChildId(child.id)}
                    className="text-xs font-semibold text-slate-700 hover:text-emerald-800 px-3 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                  >
                    {language === 'mr' ? 'हे बाळ निवडा' : 'Switch to this Child'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">
              {t.children.deleteChild}
            </h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              {t.children.confirmDelete}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteChild(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm"
              >
                Delete Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Child Modal */}
      {editingChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="font-bold text-slate-900 text-base mb-4">
              {t.children.editChild}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {t.children.nameLabel}
                </label>
                <input
                  type="text"
                  value={editingChild.name}
                  onChange={(e) => setEditingChild({ ...editingChild, name: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {t.children.bloodGroupLabel}
                  </label>
                  <input
                    type="text"
                    value={editingChild.bloodGroup || ''}
                    onChange={(e) => setEditingChild({ ...editingChild, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {t.children.birthWeightLabel}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingChild.birthWeightKg || ''}
                    onChange={(e) => setEditingChild({ ...editingChild, birthWeightKg: parseFloat(e.target.value) || undefined })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {t.children.notesLabel}
                </label>
                <textarea
                  value={editingChild.notes || ''}
                  onChange={(e) => setEditingChild({ ...editingChild, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingChild(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-stone-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateChild(editingChild.id, editingChild);
                  setEditingChild(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-colors shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
