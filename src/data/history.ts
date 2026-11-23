import { newId, readJSON, writeJSON } from './storage';
import { useStored } from './useStored';
import type { HistoryEntry } from './types';

const KEY = 'content:history';
const EMPTY: HistoryEntry[] = [];
const MAX_ENTRIES = 500;

export function getHistory(): HistoryEntry[] {
  return readJSON(KEY, EMPTY);
}

export function useHistory(): HistoryEntry[] {
  return useStored(KEY, EMPTY);
}

export function logChange(entry: Omit<HistoryEntry, 'id' | 'at'>): void {
  const next: HistoryEntry = { ...entry, id: newId('h'), at: new Date().toISOString() };
  writeJSON(KEY, [next, ...getHistory()].slice(0, MAX_ENTRIES));
}
