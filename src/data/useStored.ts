import { useSyncExternalStore } from 'react';
import { readJSON, subscribe } from './storage';

/** Subscribe a component to a storage key. `fallback` must be referentially stable. */
export function useStored<T>(key: string, fallback: T): T {
  return useSyncExternalStore(
    subscribe,
    () => readJSON(key, fallback),
    () => fallback,
  );
}
