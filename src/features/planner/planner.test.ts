import { describe, expect, it } from 'vitest';
import { SEED } from '../../data/content';
import { flagsForTerm, moveItem, placedIds, TRAY, upcomingTerms } from './planner';

const opp = (id: string) => SEED.opportunities.find((o) => o.id === id)!;

describe('planner', () => {
  it('Priya: three semesters from November produce spring, summer, fall, spring', () => {
    const terms = upcomingTerms(3, new Date(2026, 10, 23));
    expect(terms.map((t) => t.label)).toEqual([
      'Spring 2027',
      'Summer 2027',
      'Fall 2027',
      'Spring 2028',
    ]);
  });

  it('starts with fall when planning in spring/summer', () => {
    expect(upcomingTerms(2, new Date(2026, 4, 1)).map((t) => t.id)).toEqual([
      'fall-2026',
      'spring-2027',
    ]);
  });

  it('moves items between containers without duplicating them', () => {
    let tl = moveItem({}, 'aws-saa', TRAY);
    tl = moveItem(tl, 'aws-saa', 'spring-2027');
    tl = moveItem(tl, 'aws-saa', 'fall-2027');
    expect(tl[TRAY]).toEqual([]);
    expect(tl['spring-2027']).toEqual([]);
    expect(tl['fall-2027']).toEqual(['aws-saa']);
    expect(placedIds(tl, upcomingTerms(3, new Date(2026, 10, 1))).has('aws-saa')).toBe(true);
  });

  it('flags terms where planned hours exceed the weekly limit', () => {
    const t = upcomingTerms(1, new Date(2026, 10, 1))[0]!;
    const flags = flagsForTerm(t, [opp('aws-saa'), opp('project-serverless-resume')], 8);
    expect(flags.find((f) => f.kind === 'overload')?.text).toMatch(/11 hrs\/week.*8 hrs\/week/);
    expect(flagsForTerm(t, [opp('aws-ccp')], 8).some((f) => f.kind === 'overload')).toBe(false);
  });

  it('flags known timing windows, including off-window placement', () => {
    const fall = { id: 'fall-2027', season: 'fall' as const, year: 2027, label: 'Fall 2027' };
    const spring = {
      id: 'spring-2027',
      season: 'spring' as const,
      year: 2027,
      label: 'Spring 2027',
    };
    const summer = {
      id: 'summer-2027',
      season: 'summer' as const,
      year: 2027,
      label: 'Summer 2027',
    };
    expect(
      flagsForTerm(fall, [opp('cloud-internship-bigtech')]).some(
        (f) => f.kind === 'window' && /Early recruiting/.test(f.text),
      ),
    ).toBe(true);
    expect(
      flagsForTerm(spring, [opp('cloud-internship-bigtech')]).some((f) => f.kind === 'off_window'),
    ).toBe(true);
    expect(
      flagsForTerm(summer, [opp('cloud-internship-bigtech')]).some(
        (f) => f.kind === 'reminder' && /fall/.test(f.text),
      ),
    ).toBe(true);
  });
});
