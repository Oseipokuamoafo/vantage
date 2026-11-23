import { YEARS, type Year, type YesNoPrivate } from '../../data/types';

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return 'Enter your email address.';
  if (!EMAIL_RE.test(email.trim())) return 'Enter an email address like name@school.edu.';
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (password.length < 8) return 'Use at least 8 characters.';
  if (password.length > 128) return 'Use 128 characters or fewer.';
  return undefined;
}

export function validateSignUp(input: { email: string; password: string; confirm: string }) {
  const errors: FieldErrors<'email' | 'password' | 'confirm'> = {};
  const email = validateEmail(input.email);
  const password = validatePassword(input.password);
  if (email) errors.email = email;
  if (password) errors.password = password;
  if (input.confirm !== input.password) errors.confirm = 'Passwords do not match.';
  return errors;
}

export interface ProfileDraft {
  year: string;
  major: string;
  institution: string;
  firstGen: string;
  transferStudent: string;
  workingWhileStudying: string;
}

export const YEAR_LABELS: Record<Year, string> = {
  first_year: 'First year',
  sophomore: 'Sophomore',
  junior: 'Junior',
  senior: 'Senior',
  graduate: 'Graduate student',
  other: 'Other',
};

export const YES_NO_LABELS: Record<YesNoPrivate, string> = {
  yes: 'Yes',
  no: 'No',
  prefer_not: 'Prefer not to say',
};

const OPTIONAL_VALUES = ['', 'yes', 'no', 'prefer_not'];

export function validateProfile(d: ProfileDraft) {
  const errors: FieldErrors<keyof ProfileDraft> = {};
  if (!YEARS.includes(d.year as Year)) errors.year = 'Choose your year.';
  const major = d.major.trim();
  if (major.length < 2) errors.major = 'Enter your major (at least 2 characters).';
  else if (major.length > 80) errors.major = 'Use 80 characters or fewer.';
  const inst = d.institution.trim();
  if (inst.length < 2) errors.institution = 'Enter your institution (at least 2 characters).';
  else if (inst.length > 120) errors.institution = 'Use 120 characters or fewer.';
  for (const k of ['firstGen', 'transferStudent', 'workingWhileStudying'] as const) {
    if (!OPTIONAL_VALUES.includes(d[k])) errors[k] = 'Choose one of the listed options.';
  }
  return errors;
}

export const hasErrors = (e: object) => Object.keys(e).length > 0;
