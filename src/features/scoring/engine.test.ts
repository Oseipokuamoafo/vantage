import { describe, expect, it } from 'vitest';
import { SEED } from '../../data/content';
import type { Constraints, GoalType, Opportunity } from '../../data/types';
import { normalizeWeights, scoreAll, scoreOpportunity } from './engine';

const goal = SEED.goalTypes.find((g) => g.id === 'cloud-internship')!;
const opp = (id: string): Opportunity => {
  const o = SEED.opportunities.find((x) => x.id === id);
  if (!o) throw new Error(`missing seed opportunity ${id}`);
  return o;
};

const marcus: Constraints = { weeklyHours: 8, budgetUSD: 100, semestersRemaining: 5 };
const priya: Constraints = { weeklyHours: 12, budgetUSD: 300, semestersRemaining: 3 };
const devon: Constraints = { weeklyHours: 10, budgetUSD: 200, semestersRemaining: 5 };

describe('scoring engine', () => {
  it('matches the worked example in ARCHITECTURE.md (Marcus × AWS SAA)', () => {
    const r = scoreOpportunity(opp('aws-saa'), goal, marcus);
    expect(r.attributes.time.score).toBe(8.8);
    expect(r.attributes.skill.score).toBe(10);
    expect(r.attributes.signaling.score).toBe(7);
    expect(r.weightedSummary).toBe(8.5);
    expect(r.primaryDriver).toBe('skill');
    expect(r.fit?.totalDelta).toBe(-1.5);
    expect(r.fit?.fitAdjustedSummary).toBe(7);
    const budget = r.fit?.adjustments.find((a) => a.constraint === 'budget');
    expect(budget?.status).toBe('exceeds');
    expect(budget?.note).toContain('$150');
  });

  it('Marcus: a 40 hr/week internship is flagged against his 8 hours, with a capped adjustment', () => {
    const r = scoreOpportunity(opp('cloud-internship-bigtech'), goal, marcus);
    const hours = r.fit!.adjustments.find((a) => a.constraint === 'weeklyHours')!;
    expect(hours.status).toBe('exceeds');
    expect(hours.delta).toBe(-3);
    expect(r.attributes.signaling.score).toBe(10);
  });

  it('Marcus: zero-cost options show no budget adjustment', () => {
    const r = scoreOpportunity(opp('org-cloud-club'), goal, marcus);
    const budget = r.fit!.adjustments.find((a) => a.constraint === 'budget')!;
    expect(budget.status).toBe('fits');
    expect(budget.delta).toBe(0);
  });

  it('keeps constraints out of the base rating (fit is separate)', () => {
    const withC = scoreOpportunity(opp('aws-saa'), goal, marcus);
    const without = scoreOpportunity(opp('aws-saa'), goal);
    expect(withC.weightedSummary).toBe(without.weightedSummary);
    expect(withC.attributes).toEqual(without.attributes);
    expect(without.fit).toBeNull();
  });

  it('Priya: timeline adjustments respect few remaining semesters', () => {
    const long: Opportunity = { ...opp('org-cloud-club'), id: 'long', durationWeeks: 60 };
    const r = scoreOpportunity(long, goal, priya);
    const t = r.fit!.adjustments.find((a) => a.constraint === 'timeline')!;
    expect(t.status).toBe('exceeds');
    expect(t.delta).toBe(-2);
    const ok = scoreOpportunity(opp('org-cloud-club'), goal, priya);
    expect(ok.fit!.adjustments.find((a) => a.constraint === 'timeline')!.status).toBe('fits');
  });

  it('Priya: tight weekly-hours fit is labelled without a penalty', () => {
    const r = scoreOpportunity(opp('campus-it-job'), goal, priya); // 10 of 12 hours
    const hours = r.fit!.adjustments.find((a) => a.constraint === 'weeklyHours')!;
    expect(hours.status).toBe('tight');
    expect(hours.delta).toBe(0);
  });

  it('Devon: certification vs side project vs student org each explain their own driver', () => {
    const results = scoreAll(
      [opp('aws-saa'), opp('project-serverless-resume'), opp('org-cloud-club')],
      goal,
      devon,
    );
    expect(results['aws-saa']!.weightedSummary).toBe(8.5);
    expect(results['project-serverless-resume']!.weightedSummary).toBe(8.2);
    expect(results['org-cloud-club']!.weightedSummary).toBe(5.8);
    expect(results['org-cloud-club']!.primaryDriver).toBe('time');
    for (const r of Object.values(results)) {
      for (const a of Object.values(r.attributes)) {
        expect(a.drivers.length).toBeGreaterThan(0);
        expect(a.summary.length).toBeGreaterThan(0);
      }
      expect(r.primaryDriverReason).toMatch(/contributes the largest share/);
      expect(['sourced', 'limited', 'team_estimate']).toContain(r.dataQuality);
    }
  });

  it('weightings from data change the result immediately', () => {
    const skillHeavy: GoalType = { ...goal, weights: { time: 0, skill: 1, signaling: 0 } };
    const r = scoreOpportunity(opp('org-cloud-club'), skillHeavy);
    expect(r.weightedSummary).toBe(5);
    expect(r.primaryDriver).toBe('skill');
  });

  it('normalizes weights and handles all-zero weights', () => {
    expect(normalizeWeights({ time: 1, skill: 1, signaling: 2 })).toEqual({
      time: 0.25,
      skill: 0.25,
      signaling: 0.5,
    });
    const eq = normalizeWeights({ time: 0, skill: 0, signaling: 0 });
    expect(eq.time).toBeCloseTo(1 / 3);
  });

  it('missing goal relevance yields signaling 0 with an explicit driver', () => {
    const phd = SEED.goalTypes.find((g) => g.id === 'cs-phd')!;
    const r = scoreOpportunity(opp('aws-ccp'), phd);
    expect(r.attributes.signaling.score).toBe(0);
    expect(r.attributes.signaling.summary).toMatch(/No signaling data/);
  });

  it('keeps every score within 0–10 for all seed data', () => {
    for (const g of SEED.goalTypes) {
      for (const o of SEED.opportunities) {
        const r = scoreOpportunity(o, g, marcus);
        for (const a of Object.values(r.attributes)) {
          expect(a.score).toBeGreaterThanOrEqual(0);
          expect(a.score).toBeLessThanOrEqual(10);
        }
        expect(r.fit!.fitAdjustedSummary).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
