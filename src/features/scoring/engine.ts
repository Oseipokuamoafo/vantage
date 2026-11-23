// Goal-based scoring engine (F5). Pure functions only: no React, no storage.
// Formula and worked example: docs/ARCHITECTURE.md#scoring-model-f5

import type {
  AttributeKey,
  Constraints,
  DataQuality,
  GoalType,
  Opportunity,
  Weights,
} from '../../data/types';

export const ATTRIBUTE_ORDER: AttributeKey[] = ['time', 'skill', 'signaling'];

export const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  time: 'Time commitment',
  skill: 'Skill development',
  signaling: 'Signaling value',
};

export const ATTRIBUTE_SCALE_NOTES: Record<AttributeKey, string> = {
  time: 'Higher means a lighter total time load.',
  skill: "Higher means more of the goal's target skills are built.",
  signaling:
    'Higher means recruiters or programs for this goal tend to read it as a stronger signal.',
};

export interface AttributeScore {
  key: AttributeKey;
  label: string;
  /** 0–10, rounded to one decimal. */
  score: number;
  /** Normalized weight (weights sum to 1). */
  weight: number;
  /** weight × score, rounded to one decimal. */
  contribution: number;
  /** Short reason, shown inline next to the score. */
  summary: string;
  /** Full list of inputs behind the score, shown in the explanation panel. */
  drivers: string[];
}

export type FitStatus = 'fits' | 'tight' | 'exceeds';
export type ConstraintKey = 'weeklyHours' | 'budget' | 'timeline';

export interface FitAdjustment {
  constraint: ConstraintKey;
  label: string;
  status: FitStatus;
  /** Zero or negative. Never applied to the base rating. */
  delta: number;
  note: string;
}

export interface FitResult {
  adjustments: FitAdjustment[];
  totalDelta: number;
  fitAdjustedSummary: number;
}

export interface ScoreResult {
  opportunityId: string;
  goalTypeId: string;
  attributes: Record<AttributeKey, AttributeScore>;
  weights: Weights;
  weightedSummary: number;
  primaryDriver: AttributeKey;
  primaryDriverReason: string;
  fit: FitResult | null;
  dataQuality: DataQuality;
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const money = (n: number) => `$${n % 1 === 0 ? n.toLocaleString('en-US') : n.toFixed(2)}`;

export function normalizeWeights(w: Weights): Weights {
  const safe = {
    time: Math.max(0, w.time || 0),
    skill: Math.max(0, w.skill || 0),
    signaling: Math.max(0, w.signaling || 0),
  };
  const sum = safe.time + safe.skill + safe.signaling;
  if (sum === 0) return { time: 1 / 3, skill: 1 / 3, signaling: 1 / 3 };
  return { time: safe.time / sum, skill: safe.skill / sum, signaling: safe.signaling / sum };
}

function timeScore(opp: Opportunity, goal: GoalType) {
  const cap = goal.timeHorizonHours > 0 ? goal.timeHorizonHours : 480;
  const total = opp.timeCommitmentHoursPerWeek * opp.durationWeeks;
  const raw = 10 * (1 - Math.min(total, cap) / cap);
  return {
    raw,
    summary: `About ${Math.round(total)} total hours (${opp.timeCommitmentHoursPerWeek} hrs/week for ${opp.durationWeeks} weeks)`,
    drivers: [
      `${opp.timeCommitmentHoursPerWeek} hrs/week × ${opp.durationWeeks} weeks = ${Math.round(total)} total hours`,
      `For ${goal.name}, the score reaches 0 at ${cap} total hours`,
    ],
  };
}

function skillScore(opp: Opportunity, goal: GoalType) {
  const targets = new Set(goal.targetSkills.map((s) => s.toLowerCase()));
  const matched = opp.skillsBuilt.filter((s) => targets.has(s.toLowerCase()));
  const other = opp.skillsBuilt.filter((s) => !targets.has(s.toLowerCase()));
  const saturation = goal.skillSaturation > 0 ? goal.skillSaturation : 4;
  const raw = 10 * Math.min(1, matched.length / saturation);
  const drivers = [
    matched.length
      ? `Builds ${matched.length} of this goal's target skills: ${matched.join(', ')}`
      : "Builds none of this goal's listed target skills",
    `A full score needs ${saturation} matched target skills`,
  ];
  if (other.length) drivers.push(`Also builds: ${other.join(', ')}`);
  return {
    raw,
    summary: matched.length ? `Builds ${matched.join(', ')}` : 'No target skills for this goal',
    drivers,
  };
}

function signalingScore(opp: Opportunity, goal: GoalType) {
  const rel = opp.goalRelevance[goal.id];
  if (!rel) {
    return {
      raw: 0,
      summary: 'No signaling data for this goal yet',
      drivers: [`No signaling rating has been entered for ${goal.name}`, opp.signalingNotes],
    };
  }
  const raw = clamp(rel.signaling, 0, 10);
  return { raw, summary: rel.rationale, drivers: [rel.rationale, opp.signalingNotes] };
}

export function computeFit(
  opp: Opportunity,
  constraints: Constraints,
  weightedSummary: number,
): FitResult {
  const adjustments: FitAdjustment[] = [];

  // Weekly hours
  const h = opp.timeCommitmentHoursPerWeek;
  const avail = constraints.weeklyHours;
  if (h > avail) {
    adjustments.push({
      constraint: 'weeklyHours',
      label: 'Weekly hours',
      status: 'exceeds',
      delta: -Math.min(3, (3 * (h - avail)) / avail),
      note: `Needs ${h} hrs/week; you have ${avail}.`,
    });
  } else {
    const pct = Math.round((h / avail) * 100);
    adjustments.push({
      constraint: 'weeklyHours',
      label: 'Weekly hours',
      status: h / avail > 0.75 ? 'tight' : 'fits',
      delta: 0,
      note: `Uses ${pct}% of your ${avail} hrs/week.`,
    });
  }

  // Budget
  const cost = opp.costUSD;
  const budget = constraints.budgetUSD;
  if (cost > budget) {
    adjustments.push({
      constraint: 'budget',
      label: 'Budget',
      status: 'exceeds',
      delta: -Math.min(3, (3 * (cost - budget)) / Math.max(budget, 50)),
      note: `Costs ${money(cost)}; your budget is ${money(budget)}.`,
    });
  } else {
    adjustments.push({
      constraint: 'budget',
      label: 'Budget',
      status: budget > 0 && cost / budget > 0.75 ? 'tight' : 'fits',
      delta: 0,
      note:
        cost === 0 ? 'No listed cost.' : `Costs ${money(cost)} of your ${money(budget)} budget.`,
    });
  }

  // Timeline
  const weeksAvailable = constraints.semestersRemaining * 16;
  if (opp.durationWeeks > weeksAvailable) {
    adjustments.push({
      constraint: 'timeline',
      label: 'Timeline',
      status: 'exceeds',
      delta: -2,
      note: `Runs ${opp.durationWeeks} weeks; about ${weeksAvailable} weeks of terms remain.`,
    });
  } else {
    adjustments.push({
      constraint: 'timeline',
      label: 'Timeline',
      status: opp.durationWeeks > weeksAvailable * 0.75 ? 'tight' : 'fits',
      delta: 0,
      note: `Runs ${opp.durationWeeks} weeks within your ${constraints.semestersRemaining} remaining semesters.`,
    });
  }

  const totalDelta = adjustments.reduce((s, a) => s + a.delta, 0);
  return {
    adjustments: adjustments.map((a) => ({ ...a, delta: round1(a.delta) })),
    totalDelta: round1(totalDelta),
    fitAdjustedSummary: round1(clamp(weightedSummary + totalDelta, 0, 10)),
  };
}

export function scoreOpportunity(
  opp: Opportunity,
  goal: GoalType,
  constraints?: Constraints | null,
): ScoreResult {
  const weights = normalizeWeights(goal.weights);
  const parts = {
    time: timeScore(opp, goal),
    skill: skillScore(opp, goal),
    signaling: signalingScore(opp, goal),
  };

  const rawSummary = ATTRIBUTE_ORDER.reduce((s, k) => s + weights[k] * parts[k].raw, 0);

  const attributes = Object.fromEntries(
    ATTRIBUTE_ORDER.map((k) => [
      k,
      {
        key: k,
        label: ATTRIBUTE_LABELS[k],
        score: round1(parts[k].raw),
        weight: weights[k],
        contribution: round1(weights[k] * parts[k].raw),
        summary: parts[k].summary,
        drivers: parts[k].drivers.filter(Boolean),
      },
    ]),
  ) as Record<AttributeKey, AttributeScore>;

  let primaryDriver: AttributeKey = 'time';
  for (const k of ATTRIBUTE_ORDER) {
    if (weights[k] * parts[k].raw > weights[primaryDriver] * parts[primaryDriver].raw)
      primaryDriver = k;
  }
  const weightedSummary = round1(rawSummary);
  const primary = attributes[primaryDriver];

  return {
    opportunityId: opp.id,
    goalTypeId: goal.id,
    attributes,
    weights,
    weightedSummary,
    primaryDriver,
    primaryDriverReason: `${primary.label} contributes the largest share (${primary.contribution.toFixed(1)} of ${weightedSummary.toFixed(1)}) under the ${goal.name} weightings (${Math.round(primary.weight * 100)}%).`,
    fit: constraints ? computeFit(opp, constraints, rawSummary) : null,
    dataQuality: opp.dataQuality,
  };
}

export function scoreAll(
  opps: Opportunity[],
  goal: GoalType,
  constraints?: Constraints | null,
): Record<string, ScoreResult> {
  return Object.fromEntries(opps.map((o) => [o.id, scoreOpportunity(o, goal, constraints)]));
}
