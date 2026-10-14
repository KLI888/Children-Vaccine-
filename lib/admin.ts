import type { UserProfile } from './types';

export const STORAGE_KEY_PREFIX = 'cvm_v1_';
export const ADMIN_USER_EMAIL = 'admin@childvaccine.com';
export const ADMIN_USER_PASSWORD = 'admin123';

export function isAdminUser(user: Pick<UserProfile, 'email' | 'role'> | null | undefined): boolean {
  if (!user) return false;
  return user.role === 'admin';
}

export function canSwitchUser(
  currentUser: Pick<UserProfile, 'id' | 'email' | 'role'> | null | undefined,
  targetUser: Pick<UserProfile, 'id' | 'email' | 'role'>
): boolean {
  return Boolean(currentUser && (isAdminUser(currentUser) || currentUser.id === targetUser.id));
}

export function getUserDataKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}userdata_${userId}`;
}

export function createDefaultAdminUser(): UserProfile {
  return {
    id: 'admin_user_1',
    email: ADMIN_USER_EMAIL,
    displayName: 'System Administrator',
    password: ADMIN_USER_PASSWORD,
    preferredLanguage: 'en',
    timezone: 'Asia/Kolkata',
    onboardingCompleted: true,
    createdAt: new Date().toISOString(),
    role: 'admin',
  };
}
