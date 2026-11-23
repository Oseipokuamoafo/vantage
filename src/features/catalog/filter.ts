import type { Constraints, Opportunity, OpportunityType } from '../../data/types';

export interface CatalogFilters {
  query: string;
  types: OpportunityType[];
  withinHours: boolean;
  withinBudget: boolean;
  goalTypeId?: string;
}

export const EMPTY_FILTERS: CatalogFilters = {
  query: '',
  types: [],
  withinHours: false,
  withinBudget: false,
};

/** Filters the catalog without reordering it: order always matches the content data. */
export function filterOpportunities(
  opps: Opportunity[],
  f: CatalogFilters,
  constraints?: Constraints | null,
): Opportunity[] {
  const q = f.query.trim().toLowerCase();
  return opps.filter((o) => {
    if (f.goalTypeId && !o.goalRelevance[f.goalTypeId]) return false;
    if (f.types.length && !f.types.includes(o.type)) return false;
    if (q) {
      const hay = [o.title, o.description, o.signalingNotes, ...o.skillsBuilt]
        .join(' ')
        .toLowerCase();
      if (!q.split(/\s+/).every((term) => hay.includes(term))) return false;
    }
    if (constraints && f.withinHours && o.timeCommitmentHoursPerWeek > constraints.weeklyHours)
      return false;
    if (constraints && f.withinBudget && o.costUSD > constraints.budgetUSD) return false;
    return true;
  });
}
