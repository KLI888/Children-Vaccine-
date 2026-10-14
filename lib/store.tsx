'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { format, subDays, addMonths, subMonths } from 'date-fns';
import {
  ADMIN_USER_EMAIL,
  ADMIN_USER_PASSWORD,
  STORAGE_KEY_PREFIX,
  canSwitchUser,
  createDefaultAdminUser,
  getUserDataKey,
  isAdminUser,
} from './admin';
import {
  Child,
  ChildVaccination,
  GrowthRecord,
  Language,
  NotificationDeliveryLog,
  NotificationPreferences,
  ReminderStage,
  ScheduledReminder,
  SymptomRecord,
  ToastNotification,
  UserProfile,
} from './types';
import {
  generateVaccinationSchedule,
  generateThreeStageReminders,
  VACCINE_DEFINITIONS,
} from './vaccine-data';

interface AppContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  allUsers: UserProfile[];
  language: Language;
  setLanguage: (lang: Language) => void;
  childrenList: Child[];
  selectedChild: Child | null;
  selectedChildId: string | null;
  setSelectedChildId: (id: string | null) => void;
  vaccinations: ChildVaccination[];
  reminders: ScheduledReminder[];
  growthRecords: GrowthRecord[];
  symptomRecords: SymptomRecord[];
  preferences: NotificationPreferences;
  inAppNotifications: ScheduledReminder[];
  deliveryLogs: NotificationDeliveryLog[];
  toastNotification: ToastNotification | null;
  dismissToast: () => void;
  // Actions
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password?: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUser: (userId: string) => void;
  deleteUserAccount: (userId: string) => void;
  enterDemoMode: () => void;
  resetToOfficialSeedData: () => void;
  addChild: (data: {
    name: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    bloodGroup?: string;
    birthWeightKg?: number;
    birthHeightCm?: number;
    notes?: string;
  }) => Child;
  updateChild: (id: string, data: Partial<Child>) => void;
  deleteChild: (id: string) => void;
  recordVaccination: (
    vaccinationId: string,
    data: {
      administeredDate: string;
      administeredFacility?: string;
      batchNumber?: string;
      notes?: string;
    }
  ) => void;
  updateVaccinationDueDate: (vaccinationId: string, newDueDate: string) => void;
  addGrowthRecord: (data: {
    childId: string;
    measurementDate: string;
    weightKg: number;
    heightCm?: number;
    notes?: string;
  }) => void;
  deleteGrowthRecord: (id: string) => void;
  addSymptomRecord: (data: {
    childId: string;
    vaccinationId?: string;
    onsetTimestamp: string;
    temperatureF?: number;
    temperatureC?: number;
    symptomsObserved: string[];
    durationHours?: number;
    notes?: string;
    actionTaken?: string;
    consultedDoctor?: boolean;
  }) => void;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void;
  markReminderDelivered: (id: string) => void;
  triggerTestNotification: (stage?: ReminderStage) => Promise<{
    success: boolean;
    nativePermission: string;
    inAppTriggered: boolean;
    message: string;
  }>;
}

const AppContext = createContext<AppContextType | null>(null);

// Audio chime using Web Audio API (works without external audio assets)
function playNotificationChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    // Two-tone friendly chime: F5 (698.46 Hz) to A5 (880 Hz)
    osc.frequency.setValueAtTime(698.46, audioCtx.currentTime);
    osc.frequency.setValueAtTime(880.0, audioCtx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.55);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.55);
  } catch {
    // Ignore audio autoplay restrictions if unprimed
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const rawUsers = localStorage.getItem(`${STORAGE_KEY_PREFIX}all_users`);
        if (rawUsers) {
          const parsed = JSON.parse(rawUsers);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const normalized = parsed.map((item: Partial<UserProfile>) => {
              const resolvedRole = (item.role ?? (item.email?.toLowerCase() === ADMIN_USER_EMAIL ? 'admin' : 'parent')) as 'parent' | 'admin';
              return {
                ...item,
                role: resolvedRole,
              } as UserProfile;
            });
            const hasAdmin = normalized.some((userItem) => isAdminUser(userItem));
            if (!hasAdmin) normalized.push(createDefaultAdminUser());
            return normalized;
          }
        }
      } catch {}
    }
    return [
      {
        id: 'demo_user_1',
        email: 'krushna.parent@example.com',
        displayName: 'Krushna Borase',
        password: 'password123',
        preferredLanguage: 'en',
        timezone: 'Asia/Kolkata',
        onboardingCompleted: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        role: 'parent',
      },
      createDefaultAdminUser(),
    ];
  });
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}lang`);
      if (saved === 'mr' || saved === 'en') return saved;
    }
    return 'en';
  });
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [vaccinations, setVaccinations] = useState<ChildVaccination[]>([]);
  const [reminders, setReminders] = useState<ScheduledReminder[]>([]);
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([]);
  const [symptomRecords, setSymptomRecords] = useState<SymptomRecord[]>([]);
  const [deliveryLogs, setDeliveryLogs] = useState<NotificationDeliveryLog[]>([]);
  const [toastNotification, setToastNotification] = useState<ToastNotification | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enableSevenDay: true,
    enableThreeDay: true,
    enableSameDay: true,
    enablePush: true,
    enableEmail: false,
    preferredDeliveryTime: '09:00',
    preferredLanguage: 'en',
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Set language with persistence
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}lang`, lang);
    }
  };

  const dismissToast = () => {
    setToastNotification(null);
  };

  // Auto-dismiss toast after 7 seconds
  useEffect(() => {
    if (!toastNotification) return;
    const timer = setTimeout(() => {
      setToastNotification(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [toastNotification]);

  // Seed demo data for rich initial experience
  const initializeSeedData = () => {
    const demoUser: UserProfile = {
      id: 'demo_user_1',
      email: 'krushna.parent@example.com',
      displayName: 'Krushna Borase',
      password: 'password123',
      preferredLanguage: 'en',
      timezone: 'Asia/Kolkata',
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
      role: 'parent',
    };

    const today = new Date();
    const childDob = format(subDays(today, 90), 'yyyy-MM-dd');

    const demoChild: Child = {
      id: 'child_aarav_1',
      parentId: demoUser.id,
      name: 'Aarav Borase',
      dateOfBirth: childDob,
      gender: 'male',
      bloodGroup: 'B+',
      birthWeightKg: 3.2,
      birthHeightCm: 49.5,
      notes: 'Delivered full-term at District Hospital, Nashik. All birth vaccines administered at birth.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Generate schedule
    const generatedVax = generateVaccinationSchedule(demoChild.id, demoChild.dateOfBirth, true);

    // Mark birth and 6-week vaccines as completed with realistic records
    const vaxWithHistory = generatedVax.map((v) => {
      if (v.vaccineId === 'bcg' || v.vaccineId === 'hepb' || (v.vaccineId === 'opv' && v.doseNumber === 1)) {
        return {
          ...v,
          status: 'completed' as const,
          administeredDate: demoChild.dateOfBirth,
          administeredFacility: 'District Hospital Postnatal Ward, Nashik',
          batchNumber: 'BCG-2481A',
        };
      }
      if (v.doseNumber === 1 && (v.vaccineId === 'pentavalent' || v.vaccineId === 'rvv' || v.vaccineId === 'pcv' || v.vaccineId === 'fipv')) {
        return {
          ...v,
          status: 'completed' as const,
          administeredDate: format(subDays(today, 45), 'yyyy-MM-dd'),
          administeredFacility: 'Urban Primary Health Centre (UPHC), Nashik',
          batchNumber: 'PNT-8902',
          notes: 'Mild low-grade fever noted for 24h, resolved naturally.',
        };
      }
      return v;
    });

    // Generate 3-stage reminders for all doses
    let allReminders: ScheduledReminder[] = [];
    vaxWithHistory.forEach((v) => {
      const rems = generateThreeStageReminders(demoUser.id, demoChild, v);
      allReminders = allReminders.concat(rems);
    });

    // Growth records
    const initialGrowth: GrowthRecord[] = [
      {
        id: 'growth_1',
        childId: demoChild.id,
        measurementDate: childDob,
        weightKg: 3.2,
        heightCm: 49.5,
        headCircumferenceCm: 34.0,
        notes: 'Birth measurement',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'growth_2',
        childId: demoChild.id,
        measurementDate: format(subDays(today, 45), 'yyyy-MM-dd'),
        weightKg: 4.8,
        heightCm: 56.0,
        headCircumferenceCm: 37.5,
        notes: '6-week immunization visit checkup',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'growth_3',
        childId: demoChild.id,
        measurementDate: format(subDays(today, 10), 'yyyy-MM-dd'),
        weightKg: 6.1,
        heightCm: 61.2,
        headCircumferenceCm: 40.1,
        notes: '3-month milestone check',
        createdAt: new Date().toISOString(),
      },
    ];

    // Symptom log
    const initialSymptoms: SymptomRecord[] = [
      {
        id: 'symp_1',
        childId: demoChild.id,
        vaccineName: 'Pentavalent Dose 1',
        onsetTimestamp: format(subDays(today, 44), "yyyy-MM-dd'T'18:30:00"),
        temperatureF: 100.4,
        temperatureC: 38.0,
        symptomsObserved: [
          'Mild Fever (99–101°F)',
          'Injection site pain/swelling',
          'Fussiness / continuous crying',
        ],
        durationHours: 24,
        actionTaken: 'Paracetamol paediatric drops (100mg/mL) 0.6mL given as prescribed by MO, cold damp cloth on forehead.',
        consultedDoctor: true,
        notes: 'Fever subsided completely within 24 hours. Feeding well.',
        createdAt: new Date().toISOString(),
      },
    ];

    // Initial delivery logs
    const initialLogs: NotificationDeliveryLog[] = [
      {
        id: 'log_seed_1',
        reminderId: allReminders[0]?.id || 'rem_1',
        channel: 'in_app',
        status: 'delivered',
        responsePayload: { channel: 'in_app', stage: 'seven_day', recipient: 'krushna.parent@example.com' },
        attemptedAt: format(subDays(today, 1), "yyyy-MM-dd'T'09:00:00"),
      },
    ];

    setUser(demoUser);
    setChildrenList([demoChild]);
    setSelectedChildId(demoChild.id);
    setVaccinations(vaxWithHistory);
    setReminders(allReminders);
    setGrowthRecords(initialGrowth);
    setSymptomRecords(initialSymptoms);
    setDeliveryLogs(initialLogs);
  };

  // Helper to load user and their isolated data
  const loadUserAndIsolatedData = (targetUser: UserProfile) => {
    setUser(targetUser);
    if (typeof window === 'undefined') return;

    try {
      const dataKey = getUserDataKey(targetUser.id);
      const rawData = localStorage.getItem(dataKey);

      if (rawData) {
        const parsed = JSON.parse(rawData);
        const children = parsed.children || [];
        setChildrenList(children);
        setSelectedChildId(children[0]?.id || null);
        setVaccinations(parsed.vaccinations || []);
        setReminders(parsed.reminders || []);
        setGrowthRecords(parsed.growthRecords || []);
        setSymptomRecords(parsed.symptomRecords || []);
        setDeliveryLogs(parsed.logs || []);
        if (parsed.prefs) setPreferences(parsed.prefs);
      } else if (targetUser.id === 'demo_user_1') {
        initializeSeedData();
      } else {
        // Fresh user starts with 0 children
        setChildrenList([]);
        setSelectedChildId(null);
        setVaccinations([]);
        setReminders([]);
        setGrowthRecords([]);
        setSymptomRecords([]);
        setDeliveryLogs([]);
      }

      localStorage.setItem(`${STORAGE_KEY_PREFIX}active_user_id`, targetUser.id);
    } catch {
      // Fallback
    }
  };

  // Initialize from storage or seed
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const timer = setTimeout(() => {
      try {
        const activeUserId = localStorage.getItem(`${STORAGE_KEY_PREFIX}active_user_id`);
        if (activeUserId === 'LOGGED_OUT') {
          // User explicitly logged out: do not automatically reinstate demo user
          setUser(null);
          setChildrenList([]);
          setSelectedChildId(null);
          setVaccinations([]);
          setReminders([]);
          setGrowthRecords([]);
          setSymptomRecords([]);
          setDeliveryLogs([]);
        } else {
          const activeUser = allUsers.find((u) => u.id === activeUserId);
          if (activeUser) {
            loadUserAndIsolatedData(activeUser);
          } else {
            const demoUser = allUsers.find((u) => u.id === 'demo_user_1') || allUsers[0];
            if (demoUser) {
              loadUserAndIsolatedData(demoUser);
            } else {
              initializeSeedData();
            }
          }
        }
      } catch {
        initializeSeedData();
      } finally {
        setIsInitialized(true);
      }
    }, 0);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save changes to localStorage per active user
  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined' || !user) return;
    const dataToSave = {
      children: childrenList,
      vaccinations,
      reminders,
      growthRecords,
      symptomRecords,
      logs: deliveryLogs,
      prefs: preferences,
    };

    try {
      localStorage.setItem(getUserDataKey(user.id), JSON.stringify(dataToSave));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}active_user_id`, user.id);
    } catch {
      // Storage error safeguard
    }
  }, [user, childrenList, vaccinations, reminders, growthRecords, symptomRecords, deliveryLogs, preferences, isInitialized]);

  const selectedChild = useMemo(() => {
    return childrenList.find((c) => c.id === selectedChildId) || childrenList[0] || null;
  }, [childrenList, selectedChildId]);

  // In-app notifications
  const inAppNotifications = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return reminders.filter(
      (r) =>
        r.status === 'delivered' ||
        (r.status === 'pending' && r.triggerDate <= todayStr)
    );
  }, [reminders]);

  // Auth functions with true multi-user isolation
  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Email address is required.' };
    }

    const existing = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!existing) {
      return {
        success: false,
        error: 'No account registered with this email. Please click "Sign Up" below to create an account.',
      };
    }

    if (!password || !existing.password || existing.password !== password) {
      return {
        success: false,
        error: 'Incorrect password. Please verify and try again.',
      };
    }

    loadUserAndIsolatedData(existing);
    return { success: true };
  };

  const signup = async (
    email: string,
    password?: string,
    name?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (password && password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    const existing = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return {
        success: false,
        error: 'An account with this email already exists. Please log in instead.',
      };
    }

    if (cleanEmail === ADMIN_USER_EMAIL) {
      return {
        success: false,
        error: 'This admin account is reserved. Please sign in using the admin credentials instead.',
      };
    }

    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      email: cleanEmail,
      displayName: name?.trim() || cleanEmail.split('@')[0],
      password: password || 'password123',
      preferredLanguage: language,
      timezone: 'Asia/Kolkata',
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
      role: 'parent',
    };

    const updated = [...allUsers, newUser];
    setAllUsers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}all_users`, JSON.stringify(updated));
      localStorage.setItem(
        getUserDataKey(newUser.id),
        JSON.stringify({
          children: [],
          vaccinations: [],
          reminders: [],
          growthRecords: [],
          symptomRecords: [],
          logs: [],
        })
      );
    }
    loadUserAndIsolatedData(newUser);
    return { success: true };
  };

  const logout = () => {
    if (user && typeof window !== 'undefined') {
      // Save data for current user before clearing
      const dataToSave = {
        children: childrenList,
        vaccinations,
        reminders,
        growthRecords,
        symptomRecords,
        logs: deliveryLogs,
        prefs: preferences,
      };
      localStorage.setItem(getUserDataKey(user.id), JSON.stringify(dataToSave));
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}active_user_id`, 'LOGGED_OUT');
    }

    setUser(null);
    setChildrenList([]);
    setSelectedChildId(null);
    setVaccinations([]);
    setReminders([]);
    setGrowthRecords([]);
    setSymptomRecords([]);
    setDeliveryLogs([]);
  };

  const switchUser = (userId: string) => {
    const target = allUsers.find((u) => u.id === userId);
    if (target && canSwitchUser(user, target)) {
      loadUserAndIsolatedData(target);
    }
  };

  const isAdmin = isAdminUser(user);

  const deleteUserAccount = (userId: string) => {
    if (userId === 'demo_user_1' || allUsers.find((u) => u.id === userId)?.role === 'admin') return;
    const updated = allUsers.filter((u) => u.id !== userId);
    setAllUsers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}all_users`, JSON.stringify(updated));
      localStorage.removeItem(getUserDataKey(userId));
    }
    if (user?.id === userId) {
      const demo = updated.find((u) => u.id === 'demo_user_1') || updated[0];
      if (demo) loadUserAndIsolatedData(demo);
      else logout();
    }
  };

  const enterDemoMode = () => {
    const demo = allUsers.find((u) => u.id === 'demo_user_1');
    if (demo) {
      loadUserAndIsolatedData(demo);
    } else {
      initializeSeedData();
    }
  };

  const resetToOfficialSeedData = () => {
    initializeSeedData();
  };

  // Add child
  const addChild = (data: {
    name: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    bloodGroup?: string;
    birthWeightKg?: number;
    birthHeightCm?: number;
    notes?: string;
  }): Child => {
    const newChildId = `child_${Date.now()}`;
    const newChild: Child = {
      id: newChildId,
      parentId: user?.id || 'parent_user',
      name: data.name,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      bloodGroup: data.bloodGroup,
      birthWeightKg: data.birthWeightKg,
      birthHeightCm: data.birthHeightCm,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newSchedule = generateVaccinationSchedule(newChildId, data.dateOfBirth, true);

    let newReminders: ScheduledReminder[] = [];
    newSchedule.forEach((v) => {
      const rems = generateThreeStageReminders(user?.id || 'parent_user', newChild, v);
      newReminders = newReminders.concat(rems);
    });

    let newGrowthEntries: GrowthRecord[] = [];
    if (data.birthWeightKg) {
      newGrowthEntries.push({
        id: `growth_${Date.now()}`,
        childId: newChildId,
        measurementDate: data.dateOfBirth,
        weightKg: data.birthWeightKg,
        heightCm: data.birthHeightCm,
        notes: 'Birth measurement',
        createdAt: new Date().toISOString(),
      });
    }

    setChildrenList((prev) => [...prev, newChild]);
    setSelectedChildId(newChildId);
    setVaccinations((prev) => [...prev, ...newSchedule]);
    setReminders((prev) => [...prev, ...newReminders]);
    if (newGrowthEntries.length > 0) {
      setGrowthRecords((prev) => [...prev, ...newGrowthEntries]);
    }

    return newChild;
  };

  const updateChild = (id: string, data: Partial<Child>) => {
    setChildrenList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c))
    );
  };

  const deleteChild = (id: string) => {
    setChildrenList((prev) => prev.filter((c) => c.id !== id));
    setVaccinations((prev) => prev.filter((v) => v.childId !== id));
    setReminders((prev) => prev.filter((r) => r.childId !== id));
    setGrowthRecords((prev) => prev.filter((g) => g.childId !== id));
    setSymptomRecords((prev) => prev.filter((s) => s.childId !== id));
    if (selectedChildId === id) {
      const remaining = childrenList.filter((c) => c.id !== id);
      setSelectedChildId(remaining[0]?.id || null);
    }
  };

  // Record vaccination as completed
  const recordVaccination = (
    vaccinationId: string,
    data: {
      administeredDate: string;
      administeredFacility?: string;
      batchNumber?: string;
      notes?: string;
    }
  ) => {
    setVaccinations((prev) =>
      prev.map((v) => {
        if (v.id === vaccinationId) {
          return {
            ...v,
            status: 'completed' as const,
            administeredDate: data.administeredDate,
            administeredFacility: data.administeredFacility,
            batchNumber: data.batchNumber,
            notes: data.notes,
            updatedAt: new Date().toISOString(),
          };
        }
        return v;
      })
    );

    // Cancel pending reminders for this completed vaccination
    setReminders((prev) =>
      prev.map((r) => {
        if (r.vaccinationId === vaccinationId && r.status === 'pending') {
          return {
            ...r,
            status: 'cancelled' as const,
            updatedAt: new Date().toISOString(),
          };
        }
        return r;
      })
    );
  };

  // Update scheduled due date and regenerate 3-stage reminders
  const updateVaccinationDueDate = (vaccinationId: string, newDueDate: string) => {
    const targetVax = vaccinations.find((v) => v.id === vaccinationId);
    if (!targetVax) return;

    const child = childrenList.find((c) => c.id === targetVax.childId);
    if (!child) return;

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    let newStatus = targetVax.status;
    if (targetVax.status !== 'completed') {
      if (newDueDate === todayStr) newStatus = 'due_today';
      else if (newDueDate < todayStr) newStatus = 'overdue';
      else newStatus = 'scheduled';
    }

    const updatedVax: ChildVaccination = {
      ...targetVax,
      dueDate: newDueDate,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    setVaccinations((prev) =>
      prev.map((v) => (v.id === vaccinationId ? updatedVax : v))
    );

    const freshReminders = generateThreeStageReminders(
      user?.id || 'user',
      child,
      updatedVax,
      todayStr
    );

    setReminders((prev) => {
      const kept = prev.filter(
        (r) => !(r.vaccinationId === vaccinationId && (r.status === 'pending' || r.status === 'skipped_past'))
      );
      return [...kept, ...freshReminders];
    });
  };

  // Growth records
  const addGrowthRecord = (data: {
    childId: string;
    measurementDate: string;
    weightKg: number;
    heightCm?: number;
    notes?: string;
  }) => {
    const record: GrowthRecord = {
      id: `growth_${Date.now()}`,
      childId: data.childId,
      measurementDate: data.measurementDate,
      weightKg: data.weightKg,
      heightCm: data.heightCm,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };
    setGrowthRecords((prev) => [...prev, record].sort((a, b) => a.measurementDate.localeCompare(b.measurementDate)));
  };

  const deleteGrowthRecord = (id: string) => {
    setGrowthRecords((prev) => prev.filter((g) => g.id !== id));
  };

  // Symptom records
  const addSymptomRecord = (data: {
    childId: string;
    vaccinationId?: string;
    onsetTimestamp: string;
    temperatureF?: number;
    temperatureC?: number;
    symptomsObserved: string[];
    durationHours?: number;
    notes?: string;
    actionTaken?: string;
    consultedDoctor?: boolean;
  }) => {
    let vaccineName: string | undefined;
    if (data.vaccinationId) {
      const vax = vaccinations.find((v) => v.id === data.vaccinationId);
      if (vax) {
        const def = VACCINE_DEFINITIONS[vax.vaccineId];
        vaccineName = `${def?.name || vax.vaccineId} (Dose ${vax.doseNumber})`;
      }
    }

    const record: SymptomRecord = {
      id: `symp_${Date.now()}`,
      childId: data.childId,
      vaccinationId: data.vaccinationId,
      vaccineName,
      onsetTimestamp: data.onsetTimestamp,
      temperatureF: data.temperatureF,
      temperatureC: data.temperatureC,
      symptomsObserved: data.symptomsObserved,
      durationHours: data.durationHours,
      notes: data.notes,
      actionTaken: data.actionTaken,
      consultedDoctor: data.consultedDoctor,
      createdAt: new Date().toISOString(),
    };
    setSymptomRecords((prev) => [record, ...prev]);
  };

  // Preferences
  const updatePreferences = (prefs: Partial<NotificationPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...prefs }));
  };

  const markReminderDelivered = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'delivered', deliveredAt: new Date().toISOString() } : r))
    );
  };

  // Enhanced Test Notification with 100% Guaranteed In-App Pop-up Toast + Audio Chime + Database Logging
  const triggerTestNotification = async (stage: ReminderStage = 'same_day'): Promise<{
    success: boolean;
    nativePermission: string;
    inAppTriggered: boolean;
    message: string;
  }> => {
    const childName = selectedChild?.name || 'Aarav';
    const testTitle = language === 'mr'
      ? stage === 'seven_day'
        ? 'पुढील आठवड्यात लसीकरण येत आहे (-७ दिवस)'
        : stage === 'three_day'
        ? '३ दिवसांत लसीकरण देय आहे (-३ दिवस)'
        : 'आज लसीकरण देय आहे (दिवस ०)'
      : stage === 'seven_day'
      ? 'Vaccination coming up next week (-7 Days)'
      : stage === 'three_day'
      ? 'Vaccination due in 3 days (-3 Days)'
      : 'Vaccination due today (Day 0)';

    const testBody = language === 'mr'
      ? `${childName} चे पेंटाव्हॅलेंट (Penta-2) लसीकरण नियोजित आहे. कृपया प्राथमिक आरोग्य केंद्र किंवा दवाखान्यामध्ये जाण्याची तयारी करा.`
      : `${childName}'s Pentavalent (Penta-2) vaccination is scheduled. Please confirm clinic appointment and prepare child records.`;

    // 1. Play audible notification sound chime
    playNotificationChime();

    // 2. Trigger prominent in-app floating banner toast
    setToastNotification({
      id: `toast_${Date.now()}`,
      title: testTitle,
      message: testBody,
      stage,
    });

    // 3. Create real delivered reminder record in the database store
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const testReminderId = `test_rem_${Date.now()}`;
    const newTestReminder: ScheduledReminder = {
      id: testReminderId,
      userId: user?.id || 'demo_user',
      childId: selectedChild?.id || 'child_1',
      vaccinationId: vaccinations[0]?.id || 'vax_sample',
      stage,
      triggerDate: todayStr,
      idempotencyKey: `test_notif_${stage}_${Date.now()}`,
      status: 'delivered',
      titleEn: testTitle,
      titleMr: testTitle,
      messageEn: testBody,
      messageMr: testBody,
      deliveryChannel: 'in_app',
      deliveredAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setReminders((prev) => [newTestReminder, ...prev]);

    // 4. Log in notification delivery logs
    const newLog: NotificationDeliveryLog = {
      id: `log_${Date.now()}`,
      reminderId: testReminderId,
      channel: 'in_app_banner',
      status: 'delivered',
      responsePayload: {
        stage,
        childName,
        alertType: 'simulation_test',
        chimePlayed: true,
      },
      attemptedAt: new Date().toISOString(),
    };
    setDeliveryLogs((prev) => [newLog, ...prev]);

    // 5. Try Native Browser Push / Notification API safely
    let nativePerm = 'unsupported';
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        nativePerm = Notification.permission;
        if (nativePerm === 'default') {
          nativePerm = await Notification.requestPermission();
        }
        if (nativePerm === 'granted') {
          new Notification(testTitle, {
            body: testBody,
            icon: '/icon-192.png',
            tag: `cvm-test-${Date.now()}`,
          });
        }
      } catch (err: any) {
        // Sandboxed iframe or permission restriction
        nativePerm = `restricted_in_preview (${err?.message || 'sandbox'})`;
      }
    }

    return {
      success: true,
      nativePermission: nativePerm,
      inAppTriggered: true,
      message: language === 'mr'
        ? 'सूचना स्क्रीनवर यशस्वीरीत्या प्रदर्शित झाली व आवाज आला!'
        : 'Notification chime sounded & live notification toast appeared on screen!',
    };
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAdmin,
        allUsers,
        language,
        setLanguage,
        childrenList,
        selectedChild,
        selectedChildId,
        setSelectedChildId,
        vaccinations,
        reminders,
        growthRecords,
        symptomRecords,
        preferences,
        inAppNotifications,
        deliveryLogs,
        toastNotification,
        dismissToast,
        login,
        signup,
        logout,
        switchUser,
        deleteUserAccount,
        enterDemoMode,
        resetToOfficialSeedData,
        addChild,
        updateChild,
        deleteChild,
        recordVaccination,
        updateVaccinationDueDate,
        addGrowthRecord,
        deleteGrowthRecord,
        addSymptomRecord,
        updatePreferences,
        markReminderDelivered,
        triggerTestNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
