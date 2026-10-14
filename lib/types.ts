export type Language = 'en' | 'mr';

export type VaccineCategory = 'uip_mandatory' | 'uip_regional' | 'iap_optional';

export type VaccinationStatus = 'scheduled' | 'due_today' | 'overdue' | 'completed' | 'review_needed' | 'skipped';

export type ReminderStage = 'seven_day' | 'three_day' | 'same_day';

export type ReminderStatus = 'pending' | 'delivered' | 'failed' | 'cancelled' | 'skipped_past';

export interface VaccineDefinition {
  id: string;
  name: string;
  marathiName: string;
  shortCode: string;
  category: VaccineCategory;
  diseasesPrevented: string;
  marathiDiseasesPrevented: string;
  description: string;
  marathiDescription: string;
  commonReactions: string[];
  marathiCommonReactions: string[];
  warningSigns: string[];
  marathiWarningSigns: string[];
  routeAndSite: string;
  marathiRouteAndSite: string;
  sourceRef: string;
  lastReviewed: string;
}

export interface ScheduleRule {
  id: string;
  vaccineId: string;
  doseNumber: number;
  doseLabel: string;
  marathiDoseLabel: string;
  offsetDays: number; // calendar offset from birth
  ageText: string;
  marathiAgeText: string;
  isMandatory: boolean;
  minIntervalDays?: number;
}

export interface Child {
  id: string;
  parentId: string;
  name: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  birthWeightKg?: number;
  birthHeightCm?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChildVaccination {
  id: string;
  childId: string;
  vaccineId: string;
  doseNumber: number;
  dueDate: string; // YYYY-MM-DD
  status: VaccinationStatus;
  administeredDate?: string; // YYYY-MM-DD
  administeredFacility?: string;
  batchNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledReminder {
  id: string;
  userId: string;
  childId: string;
  vaccinationId: string;
  stage: ReminderStage;
  triggerDate: string; // YYYY-MM-DD
  idempotencyKey: string;
  status: ReminderStatus;
  titleEn: string;
  titleMr: string;
  messageEn: string;
  messageMr: string;
  deliveryChannel: 'in_app' | 'push' | 'email' | 'all';
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GrowthRecord {
  id: string;
  childId: string;
  measurementDate: string; // YYYY-MM-DD
  weightKg: number;
  heightCm?: number;
  headCircumferenceCm?: number;
  notes?: string;
  createdAt: string;
}

export interface SymptomRecord {
  id: string;
  childId: string;
  vaccinationId?: string;
  vaccineName?: string;
  onsetTimestamp: string;
  temperatureC?: number;
  temperatureF?: number;
  symptomsObserved: string[];
  durationHours?: number;
  notes?: string;
  actionTaken?: string;
  consultedDoctor?: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  enableSevenDay: boolean;
  enableThreeDay: boolean;
  enableSameDay: boolean;
  enablePush: boolean;
  enableEmail: boolean;
  preferredDeliveryTime: string; // HH:MM
  preferredLanguage: Language;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  password?: string;
  role?: 'parent' | 'admin';
  preferredLanguage: Language;
  timezone: string;
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface NotificationDeliveryLog {
  id: string;
  reminderId: string;
  channel: string;
  status: string;
  responsePayload?: Record<string, any>;
  attemptedAt: string;
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  stage?: ReminderStage | 'test';
}

