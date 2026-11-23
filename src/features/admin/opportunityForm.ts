import {
  OPPORTUNITY_TYPES,
  type DataQuality,
  type GoalRelevance,
  type Opportunity,
  type OpportunityType,
  type Season,
  type TimingWindow,
} from '../../data/types';

export interface OpportunityDraft {
  id: string;
  type: string;
  title: string;
  description: string;
  hours: string;
  weeks: string;
  cost: string;
  skills: string;
  signalingNotes: string;
  timingWindows: string;
  relevance: Record<string, { signaling: string; rationale: string }>;
  source: string;
  dataQuality: string;
}

export function toDraft(o: Opportunity | null, goalIds: string[]): OpportunityDraft {
  const relevance: OpportunityDraft['relevance'] = {};
  for (const g of goalIds) {
    const r = o?.goalRelevance[g];
    relevance[g] = { signaling: r ? String(r.signaling) : '', rationale: r?.rationale ?? '' };
  }
  return {
    id: o?.id ?? '',
    type: o?.type ?? 'certification',
    title: o?.title ?? '',
    description: o?.description ?? '',
    hours: o ? String(o.timeCommitmentHoursPerWeek) : '',
    weeks: o ? String(o.durationWeeks) : '',
    cost: o ? String(o.costUSD) : '',
    skills: o?.skillsBuilt.join(', ') ?? '',
    signalingNotes: o?.signalingNotes ?? '',
    timingWindows:
      o?.timingWindows.map((w) => `${w.label} | ${w.season} | ${w.note}`).join('\n') ?? '',
    relevance,
    source: o?.source ?? 'Prototype sample data (verify with provider)',
    dataQuality: o?.dataQuality ?? 'team_estimate',
  };
}

const SEASONS: Season[] = ['spring', 'summer', 'fall'];
const QUALITIES: DataQuality[] = ['sourced', 'limited', 'team_estimate'];

export function validateOpportunityDraft(
  d: OpportunityDraft,
  opts: { isNew: boolean; existingIds: string[] },
): { errors: Record<string, string>; value?: Opportunity } {
  const errors: Record<string, string> = {};
  const id = d.id.trim();
  if (!/^[a-z0-9][a-z0-9-]{1,60}$/.test(id))
    errors.id = 'Use 2–61 lowercase letters, numbers and hyphens.';
  else if (opts.isNew && opts.existingIds.includes(id)) errors.id = 'This id is already used.';
  if (!OPPORTUNITY_TYPES.includes(d.type as OpportunityType)) errors.type = 'Choose a type.';
  if (d.title.trim().length < 3) errors.title = 'Enter a title (at least 3 characters).';
  if (d.description.trim().length < 10)
    errors.description = 'Enter a description (at least 10 characters).';
  const hours = Number(d.hours);
  if (d.hours.trim() === '' || !Number.isFinite(hours) || hours <= 0 || hours > 80)
    errors.hours = 'Enter hours per week from 0.5 to 80.';
  const weeks = Number(d.weeks);
  if (!Number.isInteger(weeks) || weeks < 1 || weeks > 104)
    errors.weeks = 'Enter a whole number of weeks from 1 to 104.';
  const cost = Number(d.cost);
  if (d.cost.trim() === '' || !Number.isFinite(cost) || cost < 0)
    errors.cost = 'Enter a cost of $0 or more.';
  const skills = d.skills
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (!skills.length) errors.skills = 'List at least one skill.';
  if (!d.source.trim()) errors.source = 'A source is required for every entry.';
  if (!QUALITIES.includes(d.dataQuality as DataQuality))
    errors.dataQuality = 'Choose a data-quality label.';

  const timingWindows: TimingWindow[] = [];
  d.timingWindows
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((line, i) => {
      const [label, season, ...rest] = line.split('|').map((s) => s.trim());
      if (!label || !SEASONS.includes(season as Season)) {
        errors.timingWindows = `Line ${i + 1}: use "label | spring, summer or fall | note".`;
        return;
      }
      timingWindows.push({ label, season: season as Season, note: rest.join(' | ') });
    });

  const goalRelevance: Record<string, GoalRelevance> = {};
  for (const [goalId, r] of Object.entries(d.relevance)) {
    if (r.signaling.trim() === '' && !r.rationale.trim()) continue;
    const s = Number(r.signaling);
    if (!Number.isFinite(s) || s < 0 || s > 10) {
      errors[`relevance.${goalId}`] = 'Signaling must be 0–10.';
      continue;
    }
    goalRelevance[goalId] = {
      signaling: s,
      rationale: r.rationale.trim() || 'No rationale given.',
    };
  }
  if (!Object.keys(goalRelevance).length)
    errors.relevance = 'Rate signaling for at least one goal type.';

  if (Object.keys(errors).length) return { errors };
  return {
    errors,
    value: {
      id,
      type: d.type as OpportunityType,
      title: d.title.trim(),
      description: d.description.trim(),
      timeCommitmentHoursPerWeek: hours,
      durationWeeks: weeks,
      costUSD: Math.round(cost * 100) / 100,
      skillsBuilt: skills,
      signalingNotes: d.signalingNotes.trim(),
      timingWindows,
      goalRelevance,
      source: d.source.trim(),
      dataQuality: d.dataQuality as DataQuality,
    },
  };
}
