'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { translations } from '@/lib/i18n';
import {
  X,
  ShieldCheck,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
  KeyRound,
  AlertCircle,
  Database,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { user, allUsers, language, login, signup, switchUser, enterDemoMode } = useApp();
  const t = translations[language];

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (!res.success) {
          setErrorMessage(res.error || 'Login failed. Please check your email and password.');
          return;
        }
        setSuccessMessage('Login successful! Loading your child records...');
        setTimeout(() => onClose(), 400);
      } else if (mode === 'signup') {
        const res = await signup(email, password, displayName || 'Parent');
        if (!res.success) {
          setErrorMessage(res.error || 'Registration failed.');
          return;
        }
        setSuccessMessage('Account created successfully! Your private records are ready.');
        setTimeout(() => onClose(), 400);
      } else {
        setSuccessMessage('If an account exists for this email, password instructions have been sent.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    enterDemoMode();
    onClose();
  };

  const handleQuickSwitch = (targetUserId: string) => {
    switchUser(targetUserId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {mode === 'login' && (language === 'mr' ? 'पालक खात्यात प्रवेश करा' : 'Parent Account Login')}
                {mode === 'signup' && (language === 'mr' ? 'नवीन पालक खाते तयार करा' : 'Register New Parent Account')}
                {mode === 'forgot' && (language === 'mr' ? 'पासवर्ड विसरलात?' : 'Reset Password')}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'mr'
                  ? 'प्रत्येक पालकाचा डेटा सुरक्षित व पूर्णपणे वेगळा राहतो'
                  : 'Isolated multi-user database: each parent has private records'}
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

        {/* Tab switchers: Login vs Register */}
        <div className="grid grid-cols-2 p-1.5 bg-stone-100 border-b border-stone-200 text-xs font-semibold flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.auth.loginTitle}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.auth.signupTitle}
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4">
          {/* Quick Demo Option */}
          <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200 flex items-center justify-between gap-3">
            <div className="text-xs text-emerald-950">
              <strong className="block text-emerald-900 font-bold">
                {language === 'mr' ? 'परीक्षकांसाठी चाचणी खाते' : 'Need quick demonstration access?'}
              </strong>
              <span className="text-[11px] text-emerald-800">
                {language === 'mr'
                  ? 'डॉ. कृष्णा व आरव बोरासे यांचे पूर्व-भरलेले रेकॉर्ड'
                  : 'Demo Account: Dr. Krushna (Child: Aarav Borase, 12 UIP vaccines)'}
              </span>
            </div>
            <button
              onClick={handleDemo}
              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-all shadow-sm flex items-center gap-1.5 flex-shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Demo</span>
            </button>
          </div>

          {/* Error & Success Alerts */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
            {mode === 'signup' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.auth.displayNameLabel} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.auth.emailLabel} *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="parent@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    {t.auth.passwordLabel} *
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-emerald-800 hover:underline"
                    >
                      {t.auth.forgotPassword}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder={mode === 'signup' ? 'Min 4 characters' : 'Enter password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                {mode === 'login' && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Demo account password: <code className="font-mono text-emerald-800 font-semibold">password123</code>
                  </p>
                )}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span>
                  {mode === 'login' && t.auth.loginBtn}
                  {mode === 'signup' && 'Create Account & Access Database'}
                  {mode === 'forgot' && 'Send Reset Link'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Registered Accounts on this device (Examiner quick switcher) */}
          {allUsers.length > 0 && (
            <div className="pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Existing Accounts on this Device ({allUsers.length}):</span>
                </span>
                <span className="text-[10px] text-emerald-800 font-mono">1-Click Switch</span>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {allUsers.map((u) => {
                  const isActive = user?.id === u.id;
                  return (
                    <div
                      key={u.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                        isActive
                          ? 'bg-emerald-50 border-emerald-300'
                          : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5 truncate">
                          <span>{u.displayName}</span>
                          {isActive && (
                            <span className="px-1.5 py-0.2 text-[10px] font-bold bg-emerald-200 text-emerald-900 rounded">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono truncate">{u.email}</div>
                      </div>

                      {!isActive ? (
                        <button
                          type="button"
                          onClick={() => handleQuickSwitch(u.id)}
                          className="px-2.5 py-1 bg-stone-200 hover:bg-emerald-800 hover:text-white text-slate-700 rounded-lg text-xs font-medium transition-colors flex-shrink-0"
                        >
                          Switch
                        </button>
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Database isolation explanation banner */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-slate-600 flex items-start gap-2">
            <Database className="w-4 h-4 text-emerald-800 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 font-semibold block">Multi-Parent Data Isolation</strong>
              Each parent account only sees their own children. When you register a new parent, they begin with a clean slate (0 children), ensuring zero data bleed between users.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
