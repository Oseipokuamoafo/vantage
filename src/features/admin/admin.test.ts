import { describe, expect, it } from 'vitest';
import { getGoalTypes, getOutcomes, importOutcomes, saveGoalType, SEED } from '../../data/content';
import { getHistory } from '../../data/history';
import { scoreOpportunity } from '../scoring';
import { parseCSV } from './csv';
import { toDraft, validateOpportunityDraft } from './opportunityForm';
import { OUTCOME_CSV_TEMPLATE, parseOutcomesCsv } from './outcomesCsv';

const known = {
  goalTypeIds: SEED.goalTypes.map((g) => g.id),
  opportunityIds: SEED.opportunities.map((o) => o.id),
};

describe('CSV parsing', () => {
  it('handles quotes, escaped quotes and CRLF', () => {
    expect(parseCSV('a,b\r\n"x, y","say ""hi"""\n')).toEqual([
      ['a', 'b'],
      ['x, y', 'say "hi"'],
    ]);
  });
});

describe('outcome CSV import', () => {
  it('accepts the template', () => {
    const r = parseOutcomesCsv(OUTCOME_CSV_TEMPLATE, known);
    expect(r.errors).toEqual([]);
    expect(r.records[0]!.outcomeRate).toBe(0.4);
  });

  it('reports row-level errors with line numbers', () => {
    const csv = `${OUTCOME_CSV_TEMPLATE}x,nope,aws-saa,metric,1.4,abc,c,,guess\n`;
    const r = parseOutcomesCsv(csv, known);
    expect(r.records).toHaveLength(1);
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0]!.line).toBe(3);
    expect(r.errors[0]!.message).toMatch(/unknown goalTypeId/);
    expect(r.errors[0]!.message).toMatch(/outcomeRate/);
    expect(r.errors[0]!.message).toMatch(/sampleSize/);
    expect(r.errors[0]!.message).toMatch(/source is required/);
    expect(r.errors[0]!.message).toMatch(/dataQuality/);
  });

  it('reports missing columns', () => {
    expect(parseOutcomesCsv('id,metric\n1,x', known).errors[0]!.message).toMatch(/Missing column/);
  });

  it('imports records and logs history', () => {
    const r = parseOutcomesCsv(OUTCOME_CSV_TEMPLATE, known);
    importOutcomes(r.records, 'append', 'admin@vantage.demo');
    expect(getOutcomes().some((o) => o.id === 'out-example')).toBe(true);
    expect(getHistory()[0]!.summary).toMatch(/Imported 1 outcome/);
    expect(getHistory()[0]!.actorEmail).toBe('admin@vantage.demo');
  });
});

describe('opportunity form', () => {
  it('requires a source and validates fields', () => {
    const d = { ...toDraft(null, ['cloud-internship']), source: '' };
    const { errors } = validateOpportunityDraft(d, { isNew: true, existingIds: [] });
    expect(errors.source).toBeDefined();
    expect(errors.id).toBeDefined();
    expect(errors.relevance).toBeDefined();
  });

  it('round-trips an existing opportunity', () => {
    const o = SEED.opportunities[0]!;
    const { value, errors } = validateOpportunityDraft(toDraft(o, known.goalTypeIds), {
      isNew: false,
      existingIds: known.opportunityIds,
    });
    expect(errors).toEqual({});
    expect(value).toEqual(o);
  });
});

describe('weightings', () => {
  it('saving goal weightings immediately changes scoring and is logged', () => {
    const goal = getGoalTypes()[0]!;
    const opp = SEED.opportunities.find((o) => o.id === 'org-cloud-club')!;
    const before = scoreOpportunity(opp, goal).weightedSummary;
    saveGoalType(
      { ...goal, weights: { time: 0, skill: 0, signaling: 1 } },
      'admin@vantage.demo',
      'Changed weightings',
    );
    const after = scoreOpportunity(opp, getGoalTypes()[0]!).weightedSummary;
    expect(after).toBe(5);
    expect(after).not.toBe(before);
    expect(getHistory()[0]!.summary).toBe('Changed weightings');
  });
});
