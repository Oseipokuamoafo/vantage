import type { Opportunity, Season, Timeline } from '../../data/types';

export const TRAY = 'tray';

export interface Term {
  id: string;
  season: Season;
  year: number;
  label: string;
}

const SEASON_LABEL: Record<Season, string> = { spring: 'Spring', summer: 'Summer', fall: 'Fall' };

const term = (season: Season, year: number): Term => ({
  id: `${season}-${year}`,
  season,
  year,
  label: `${SEASON_LABEL[season]} ${year}`,
});

/**
 * Upcoming terms to plan: `semestersRemaining` fall/spring terms starting with the next one,
 * with a summer term inserted between each spring and the fall that follows it.
 */
export function upcomingTerms(semestersRemaining: number, now: Date = new Date()): Term[] {
  const m = now.getMonth();
  let season: 'spring' | 'fall';
  let year = now.getFullYear();
  if (m <= 2) season = 'spring';
  else if (m <= 7) season = 'fall';
  else {
    season = 'spring';
    year += 1;
  }
  const out: Term[] = [];
  for (let i = 0; i < semestersRemaining; i++) {
    out.push(term(season, year));
    if (season === 'spring') {
      if (i < semestersRemaining - 1) out.push(term('summer', year));
      season = 'fall';
    } else {
      season = 'spring';
      year += 1;
    }
  }
  return out;
}

/** Moves an opportunity into a container (a term id or the tray), removing it from every other one. */
export function moveItem(timeline: Timeline, oppId: string, to: string): Timeline {
  const next: Timeline = {};
  for (const [k, ids] of Object.entries(timeline)) next[k] = ids.filter((id) => id !== oppId);
  next[to] = [...(next[to] ?? []), oppId];
  return next;
}

export function removeItem(timeline: Timeline, oppId: string): Timeline {
  const next: Timeline = {};
  for (const [k, ids] of Object.entries(timeline)) next[k] = ids.filter((id) => id !== oppId);
  return next;
}

export function placedIds(timeline: Timeline, terms: Term[]): Set<string> {
  return new Set(terms.flatMap((t) => timeline[t.id] ?? []));
}

export type FlagKind = 'overload' | 'window' | 'off_window' | 'reminder';

export interface TermFlag {
  kind: FlagKind;
  text: string;
}

export function termHours(opps: Opportunity[]): number {
  return opps.reduce((s, o) => s + o.timeCommitmentHoursPerWeek, 0);
}

export function flagsForTerm(t: Term, opps: Opportunity[], weeklyHours?: number): TermFlag[] {
  const flags: TermFlag[] = [];
  const hours = termHours(opps);
  if (weeklyHours !== undefined && hours > weeklyHours) {
    flags.push({
      kind: 'overload',
      text: `Planned ${hours} hrs/week is more than your ${weeklyHours} hrs/week limit.`,
    });
  }
  for (const o of opps) {
    if (!o.timingWindows.length) continue;
    const matching = o.timingWindows.filter((w) => w.season === t.season);
    const other = o.timingWindows.filter((w) => w.season !== t.season);
    for (const w of matching)
      flags.push({ kind: 'window', text: `${o.title}: ${w.label}. ${w.note}` });
    if (!matching.length) {
      const seasons = [...new Set(other.map((w) => w.season))].join(' or ');
      flags.push({
        kind: 'off_window',
        text: `${o.title} is usually tied to ${seasons}: ${other.map((w) => w.label.toLowerCase()).join(', ')}.`,
      });
    } else {
      for (const w of other)
        flags.push({ kind: 'reminder', text: `${o.title}: ${w.label} (${w.season}). ${w.note}` });
    }
  }
  return flags;
}
