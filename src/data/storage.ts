// Namespaced localStorage key-value store with change notifications.
// This is the only module that touches localStorage directly.

const PREFIX = 'vantage:';

type Listener = () => void;
const listeners = new Set<Listener>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export function readJSON<T>(key: string, fallback: T): T {
  const raw = safeGet(key);
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

export function writeJSON<T>(key: string, value: T): void {
  const raw = JSON.stringify(value);
  window.localStorage.setItem(PREFIX + key, raw);
  cache.set(key, { raw, value });
  notify();
}

export function removeKey(key: string): void {
  window.localStorage.removeItem(PREFIX + key);
  cache.delete(key);
  notify();
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(): void {
  listeners.forEach((l) => l());
}

if (typeof window !== 'undefined') {
  // Keep multiple tabs in sync.
  window.addEventListener('storage', (e) => {
    if (e.key === null || e.key.startsWith(PREFIX)) notify();
  });
}

export function newId(prefix: string): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}
