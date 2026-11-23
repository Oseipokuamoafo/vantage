import { readJSON, writeJSON } from './storage';
import { useStored } from './useStored';
import type { Profile } from './types';

const key = (userId: string) => `profile:${userId}`;

export function getProfile(userId: string): Profile | null {
  return readJSON<Profile | null>(key(userId), null);
}

export function useProfile(userId: string | undefined): Profile | null {
  return useStored<Profile | null>(key(userId ?? 'anonymous'), null);
}

export function saveProfile(profile: Profile): void {
  writeJSON(key(profile.userId), { ...profile, updatedAt: new Date().toISOString() });
}

export function updateProfile(userId: string, patch: Partial<Omit<Profile, 'userId'>>): void {
  const existing = getProfile(userId);
  if (!existing) throw new Error('Create a profile first.');
  saveProfile({ ...existing, ...patch });
}
