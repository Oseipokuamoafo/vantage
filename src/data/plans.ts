// Saved plans are keyed by user id, so they survive logout/login and profile edits.

import { newId, readJSON, writeJSON } from './storage';
import { useStored } from './useStored';
import type { SavedPlan } from './types';

const key = (userId: string) => `plans:${userId}`;
const NONE: SavedPlan[] = [];

export function listPlans(userId: string): SavedPlan[] {
  return readJSON(key(userId), NONE);
}

export function usePlans(userId: string | undefined): SavedPlan[] {
  return useStored(key(userId ?? 'anonymous'), NONE);
}

export function getPlan(userId: string, planId: string): SavedPlan | undefined {
  return listPlans(userId).find((p) => p.id === planId);
}

export type PlanInput = Omit<SavedPlan, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>;

export function createPlan(userId: string, input: PlanInput): SavedPlan {
  const now = new Date().toISOString();
  const plan: SavedPlan = {
    ...input,
    id: newId('plan'),
    ownerId: userId,
    createdAt: now,
    updatedAt: now,
  };
  writeJSON(key(userId), [plan, ...listPlans(userId)]);
  return plan;
}

export function updatePlan(userId: string, planId: string, patch: Partial<PlanInput>): void {
  writeJSON(
    key(userId),
    listPlans(userId).map((p) =>
      p.id === planId ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p,
    ),
  );
}

export function renamePlan(userId: string, planId: string, name: string): void {
  updatePlan(userId, planId, { name });
}

export function deletePlan(userId: string, planId: string): void {
  writeJSON(
    key(userId),
    listPlans(userId).filter((p) => p.id !== planId),
  );
}
