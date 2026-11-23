// Per-user working state: the current comparison and the planner timeline.

import { readJSON, writeJSON } from './storage';
import { useStored } from './useStored';
import type { Workspace } from './types';

export const EMPTY_WORKSPACE: Workspace = { compareIds: [], timeline: {} };
export const MAX_COMPARE = 4;
export const MIN_COMPARE = 2;

const key = (userId: string) => `workspace:${userId}`;

export function getWorkspace(userId: string): Workspace {
  return readJSON(key(userId), EMPTY_WORKSPACE);
}

export function useWorkspace(userId: string | undefined): Workspace {
  return useStored(key(userId ?? 'anonymous'), EMPTY_WORKSPACE);
}

export function updateWorkspace(userId: string, fn: (ws: Workspace) => Workspace): void {
  writeJSON(key(userId), fn(getWorkspace(userId)));
}

export function toggleCompare(userId: string, opportunityId: string): void {
  updateWorkspace(userId, (ws) => {
    if (ws.compareIds.includes(opportunityId)) {
      return { ...ws, compareIds: ws.compareIds.filter((id) => id !== opportunityId) };
    }
    if (ws.compareIds.length >= MAX_COMPARE) return ws;
    return { ...ws, compareIds: [...ws.compareIds, opportunityId] };
  });
}
