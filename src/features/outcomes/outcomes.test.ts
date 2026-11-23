import { describe, expect, it } from 'vitest';
import { SEED } from '../../data/content';
import { outcomesFor } from './outcomes';

const records = SEED.outcomes;

describe('historical outcomes', () => {
  it('shows records at or above the minimum sample size', () => {
    const v = outcomesFor(records, 'aws-saa', 'cloud-internship', 10);
    expect(v.status).toBe('available');
    const exactly = outcomesFor(records, 'terraform-associate', 'cloud-internship', 10);
    expect(exactly.status).toBe('available');
  });

  it('hides records below the minimum (Devon: student org has n=6)', () => {
    const v = outcomesFor(records, 'org-cloud-club', 'cloud-internship', 10);
    expect(v).toEqual({ status: 'below_minimum', largestSample: 6, minimum: 10 });
  });

  it('respects a configurable minimum', () => {
    expect(outcomesFor(records, 'org-cloud-club', 'cloud-internship', 5).status).toBe('available');
    expect(outcomesFor(records, 'aws-saa', 'cloud-internship', 30).status).toBe('below_minimum');
  });

  it('returns none when no records exist', () => {
    expect(outcomesFor(records, 'kcna', 'cloud-internship', 10).status).toBe('none');
  });
});
