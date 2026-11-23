import type { Constraints } from '../../data/types';

export interface ConstraintsDraft {
  weeklyHours: string;
  budgetUSD: string;
  semestersRemaining: string;
}

export const LIMITS = {
  weeklyHours: { min: 1, max: 60 },
  budgetUSD: { min: 0, max: 20000 },
  semestersRemaining: { min: 1, max: 12 },
} as const;

export function validateConstraints(d: ConstraintsDraft): {
  errors: Partial<Record<keyof ConstraintsDraft, string>>;
  value?: Constraints;
} {
  const errors: Partial<Record<keyof ConstraintsDraft, string>> = {};
  const num = (s: string) => (s.trim() === '' ? NaN : Number(s));
  const hours = num(d.weeklyHours);
  const budget = num(d.budgetUSD);
  const sems = num(d.semestersRemaining);

  if (!Number.isInteger(hours) || hours < LIMITS.weeklyHours.min || hours > LIMITS.weeklyHours.max)
    errors.weeklyHours = `Enter a whole number of hours from ${LIMITS.weeklyHours.min} to ${LIMITS.weeklyHours.max}.`;
  if (!Number.isFinite(budget) || budget < LIMITS.budgetUSD.min || budget > LIMITS.budgetUSD.max)
    errors.budgetUSD = `Enter an amount from $${LIMITS.budgetUSD.min} to $${LIMITS.budgetUSD.max.toLocaleString()}.`;
  if (
    !Number.isInteger(sems) ||
    sems < LIMITS.semestersRemaining.min ||
    sems > LIMITS.semestersRemaining.max
  )
    errors.semestersRemaining = `Enter a whole number from ${LIMITS.semestersRemaining.min} to ${LIMITS.semestersRemaining.max}.`;

  if (Object.keys(errors).length) return { errors };
  return {
    errors,
    value: {
      weeklyHours: hours,
      budgetUSD: Math.round(budget * 100) / 100,
      semestersRemaining: sems,
    },
  };
}
