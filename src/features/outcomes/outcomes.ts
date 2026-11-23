import type { OutcomeRecord } from '../../data/types';

export type OutcomeView =
  | { status: 'available'; records: OutcomeRecord[] }
  | { status: 'below_minimum'; largestSample: number; minimum: number }
  | { status: 'none'; minimum: number };

/** Outcome records only display at or above the minimum sample size. */
export function outcomesFor(
  records: OutcomeRecord[],
  opportunityId: string,
  goalTypeId: string,
  minimum: number,
): OutcomeView {
  const matching = records.filter(
    (r) => r.opportunityId === opportunityId && r.goalTypeId === goalTypeId,
  );
  if (!matching.length) return { status: 'none', minimum };
  const shown = matching.filter((r) => r.sampleSize >= minimum);
  if (!shown.length) {
    return {
      status: 'below_minimum',
      largestSample: Math.max(...matching.map((r) => r.sampleSize)),
      minimum,
    };
  }
  return { status: 'available', records: shown };
}
