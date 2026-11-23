// Local-only accounts. Prototype: credentials never leave the browser.

import { hashPassword, makeSalt } from './crypto';
import { newId, readJSON, removeKey, writeJSON } from './storage';
import { useStored } from './useStored';
import type { Role, Session, User } from './types';

const USERS = 'users';
const SESSION = 'session';
const NO_USERS: User[] = [];
const NO_SESSION: Session | null = null;

export const DEMO_ADMIN = { email: 'admin@vantage.demo', password: 'vantage-admin' } as const;
export const PERSONA_PASSWORD = 'demo-persona';

export class AuthError extends Error {}

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const getUsers = () => readJSON(USERS, NO_USERS);
export const getSession = () => readJSON<Session | null>(SESSION, NO_SESSION);

export function getCurrentUser(): User | undefined {
  const session = getSession();
  return session ? getUsers().find((u) => u.id === session.userId) : undefined;
}

export function useCurrentUser(): User | undefined {
  const session = useStored<Session | null>(SESSION, NO_SESSION);
  const users = useStored(USERS, NO_USERS);
  return session ? users.find((u) => u.id === session.userId) : undefined;
}

export function findUserByEmail(email: string): User | undefined {
  const e = normalizeEmail(email);
  return getUsers().find((u) => u.email === e);
}

export async function signUp(
  email: string,
  password: string,
  role: Role = 'student',
): Promise<User> {
  const e = normalizeEmail(email);
  if (findUserByEmail(e))
    throw new AuthError('An account with this email already exists on this device.');
  const salt = makeSalt();
  const user: User = {
    id: newId('u'),
    email: e,
    salt,
    passwordHash: await hashPassword(password, salt),
    role,
    createdAt: new Date().toISOString(),
  };
  writeJSON(USERS, [...getUsers(), user]);
  writeJSON(SESSION, { userId: user.id });
  return user;
}

export async function logIn(email: string, password: string): Promise<User> {
  const user = findUserByEmail(email);
  if (!user || (await hashPassword(password, user.salt)) !== user.passwordHash) {
    throw new AuthError('Email or password is incorrect.');
  }
  writeJSON(SESSION, { userId: user.id });
  return user;
}

export function logOut(): void {
  removeKey(SESSION);
}

/** Prototype reset: no email verification. Replace with a real reset flow in production. */
export async function resetPassword(email: string, newPassword: string): Promise<void> {
  const user = findUserByEmail(email);
  if (!user) throw new AuthError('No account with this email exists on this device.');
  const salt = makeSalt();
  const updated: User = { ...user, salt, passwordHash: await hashPassword(newPassword, salt) };
  writeJSON(
    USERS,
    getUsers().map((u) => (u.id === user.id ? updated : u)),
  );
}

/** Creates the documented demo admin account on first run. */
export async function ensureDemoAdmin(): Promise<void> {
  if (findUserByEmail(DEMO_ADMIN.email)) return;
  const salt = makeSalt();
  const admin: User = {
    id: 'u-demo-admin',
    email: DEMO_ADMIN.email,
    salt,
    passwordHash: await hashPassword(DEMO_ADMIN.password, salt),
    role: 'admin',
    createdAt: new Date().toISOString(),
  };
  writeJSON(USERS, [...getUsers(), admin]);
}
