// Content repository: opportunities, goal types, outcomes and settings.
// Reads fall back to the JSON seed; admin edits persist to storage.

import seedOpportunities from './seed/opportunities.json';
import seedGoalTypes from './seed/goalTypes.json';
import seedOutcomes from './seed/outcomes.json';
import seedSettings from './seed/settings.json';
import { readJSON, removeKey, writeJSON } from './storage';
import { useStored } from './useStored';
import { logChange } from './history';
import type { GoalType, Opportunity, OutcomeRecord, Settings } from './types';

export const SEED = {
  opportunities: seedOpportunities as unknown as Opportunity[],
  goalTypes: seedGoalTypes as unknown as GoalType[],
  outcomes: seedOutcomes as unknown as OutcomeRecord[],
  settings: seedSettings as unknown as Settings,
};

const K = {
  opportunities: 'content:opportunities',
  goalTypes: 'content:goalTypes',
  outcomes: 'content:outcomes',
  settings: 'content:settings',
} as const;

export const getOpportunities = () => readJSON(K.opportunities, SEED.opportunities);
export const getGoalTypes = () => readJSON(K.goalTypes, SEED.goalTypes);
export const getOutcomes = () => readJSON(K.outcomes, SEED.outcomes);
export const getSettings = () => readJSON(K.settings, SEED.settings);

export const useOpportunities = () => useStored(K.opportunities, SEED.opportunities);
export const useGoalTypes = () => useStored(K.goalTypes, SEED.goalTypes);
export const useOutcomes = () => useStored(K.outcomes, SEED.outcomes);
export const useSettings = () => useStored(K.settings, SEED.settings);

function upsert<T extends { id: string }>(list: T[], item: T): { next: T[]; created: boolean } {
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx === -1) return { next: [...list, item], created: true };
  const next = [...list];
  next[idx] = item;
  return { next, created: false };
}

export function saveOpportunity(opp: Opportunity, actorEmail: string): void {
  const { next, created } = upsert(getOpportunities(), opp);
  writeJSON(K.opportunities, next);
  logChange({
    actorEmail,
    entity: 'opportunity',
    entityId: opp.id,
    action: created ? 'create' : 'update',
    summary: `${created ? 'Added' : 'Edited'} opportunity "${opp.title}"`,
  });
}

export function deleteOpportunity(id: string, actorEmail: string): void {
  const existing = getOpportunities().find((o) => o.id === id);
  writeJSON(
    K.opportunities,
    getOpportunities().filter((o) => o.id !== id),
  );
  logChange({
    actorEmail,
    entity: 'opportunity',
    entityId: id,
    action: 'delete',
    summary: `Deleted opportunity "${existing?.title ?? id}"`,
  });
}

export function saveGoalType(goal: GoalType, actorEmail: string, summary?: string): void {
  const { next, created } = upsert(getGoalTypes(), goal);
  writeJSON(K.goalTypes, next);
  logChange({
    actorEmail,
    entity: 'goalType',
    entityId: goal.id,
    action: created ? 'create' : 'update',
    summary: summary ?? `${created ? 'Added' : 'Edited'} goal type "${goal.name}"`,
  });
}

export function deleteGoalType(id: string, actorEmail: string): void {
  const existing = getGoalTypes().find((g) => g.id === id);
  writeJSON(
    K.goalTypes,
    getGoalTypes().filter((g) => g.id !== id),
  );
  logChange({
    actorEmail,
    entity: 'goalType',
    entityId: id,
    action: 'delete',
    summary: `Deleted goal type "${existing?.name ?? id}"`,
  });
}

export function importOutcomes(
  records: OutcomeRecord[],
  mode: 'append' | 'replace',
  actorEmail: string,
): void {
  let next = mode === 'replace' ? [] : [...getOutcomes()];
  for (const r of records) next = upsert(next, r).next;
  writeJSON(K.outcomes, next);
  logChange({
    actorEmail,
    entity: 'outcomes',
    entityId: 'csv',
    action: 'import',
    summary: `Imported ${records.length} outcome record(s) via CSV (${mode})`,
  });
}

export function deleteOutcome(id: string, actorEmail: string): void {
  writeJSON(
    K.outcomes,
    getOutcomes().filter((o) => o.id !== id),
  );
  logChange({
    actorEmail,
    entity: 'outcomes',
    entityId: id,
    action: 'delete',
    summary: `Deleted outcome record ${id}`,
  });
}

export function saveSettings(settings: Settings, actorEmail: string): void {
  const prev = getSettings();
  writeJSON(K.settings, settings);
  const changes = (Object.keys(settings) as (keyof Settings)[])
    .filter((k) => prev[k] !== settings[k])
    .map((k) => `${k}: ${String(prev[k])} → ${String(settings[k])}`);
  logChange({
    actorEmail,
    entity: 'settings',
    entityId: 'settings',
    action: 'update',
    summary: changes.length ? `Changed settings (${changes.join(', ')})` : 'Saved settings',
  });
}

export function resetContent(actorEmail: string): void {
  Object.values(K).forEach(removeKey);
  logChange({
    actorEmail,
    entity: 'content',
    entityId: 'all',
    action: 'reset',
    summary: 'Reset all content to seed data',
  });
}

/** A goal type can be picked when it is active, or when demo mode is on. */
export function isGoalSelectable(goal: GoalType, settings: Settings): boolean {
  return goal.status === 'active' || settings.demoMode;
}
