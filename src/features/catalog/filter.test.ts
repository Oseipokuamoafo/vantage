import { describe, expect, it } from 'vitest';
import { SEED } from '../../data/content';
import { EMPTY_FILTERS, filterOpportunities } from './filter';

const all = SEED.opportunities;

describe('catalog filtering', () => {
  it('searches titles, descriptions and skills', () => {
    const r = filterOpportunities(all, { ...EMPTY_FILTERS, query: 'terraform' });
    expect(r.map((o) => o.id)).toEqual(
      expect.arrayContaining(['terraform-associate', 'project-container-pipeline']),
    );
    expect(
      filterOpportunities(all, { ...EMPTY_FILTERS, query: 'aws certified practitioner' }).map(
        (o) => o.id,
      ),
    ).toEqual(['aws-ccp']);
  });

  it('filters by type and preserves catalog order', () => {
    const r = filterOpportunities(all, { ...EMPTY_FILTERS, types: ['certification'] });
    expect(r.every((o) => o.type === 'certification')).toBe(true);
    const ids = all.filter((o) => o.type === 'certification').map((o) => o.id);
    expect(r.map((o) => o.id)).toEqual(ids);
  });

  it('applies constraint toggles only when asked', () => {
    const c = { weeklyHours: 8, budgetUSD: 100, semestersRemaining: 5 };
    const r = filterOpportunities(
      all,
      { ...EMPTY_FILTERS, withinHours: true, withinBudget: true },
      c,
    );
    expect(r.every((o) => o.timeCommitmentHoursPerWeek <= 8 && o.costUSD <= 100)).toBe(true);
    expect(filterOpportunities(all, EMPTY_FILTERS, c)).toHaveLength(all.length);
  });

  it('hides opportunities with no relevance entry for the selected goal', () => {
    const r = filterOpportunities(all, { ...EMPTY_FILTERS, goalTypeId: 'bb-banking' });
    expect(r.map((o) => o.id).sort()).toEqual(['finance-club', 'financial-modeling-course']);
  });
});
