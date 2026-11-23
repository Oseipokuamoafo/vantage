import type { Constraints, GoalType, SavedPlan, Timeline } from '../../data/types';

export interface PlanChange {
  field: string;
  before: string;
  after: string;
}

export interface CurrentState {
  goalTypeId?: string;
  constraints?: Constraints;
  opportunityIds: string[];
  timeline: Timeline;
}

const normTimeline = (t: Timeline) =>
  JSON.stringify(
    Object.keys(t)
      .filter((k) => k !== 'tray' && (t[k] ?? []).length)
      .sort()
      .map((k) => [k, t[k]]),
  );

/** Lists what differs between a saved plan and the student's current goal, constraints and selections. */
export function diffPlan(
  plan: SavedPlan,
  current: CurrentState,
  goalTypes: GoalType[],
  titleOf: (id: string) => string = (id) => id,
): PlanChange[] {
  const changes: PlanChange[] = [];
  const goalName = (id?: string) => goalTypes.find((g) => g.id === id)?.name ?? (id ? id : 'none');

  if (plan.goalTypeId !== current.goalTypeId) {
    changes.push({
      field: 'Goal',
      before: goalName(plan.goalTypeId),
      after: goalName(current.goalTypeId),
    });
  }
  const c = current.constraints;
  const fields: [keyof Constraints, string, (n: number) => string][] = [
    ['weeklyHours', 'Weekly hours', (n) => `${n} hrs/week`],
    ['budgetUSD', 'Budget', (n) => `$${n}`],
    ['semestersRemaining', 'Semesters remaining', (n) => String(n)],
  ];
  for (const [key, label, fmt] of fields) {
    if (!c) {
      changes.push({ field: label, before: fmt(plan.constraints[key]), after: 'not set' });
    } else if (plan.constraints[key] !== c[key]) {
      changes.push({ field: label, before: fmt(plan.constraints[key]), after: fmt(c[key]) });
    }
  }
  const added = current.opportunityIds.filter((id) => !plan.opportunityIds.includes(id));
  const removed = plan.opportunityIds.filter((id) => !current.opportunityIds.includes(id));
  if (added.length || removed.length) {
    changes.push({
      field: 'Compared opportunities',
      before: removed.length ? `included ${removed.map(titleOf).join(', ')}` : '—',
      after: added.length ? `now includes ${added.map(titleOf).join(', ')}` : '—',
    });
  }
  if (normTimeline(plan.timeline) !== normTimeline(current.timeline)) {
    changes.push({ field: 'Semester plan', before: 'saved arrangement', after: 'rearranged' });
  }
  return changes;
}
