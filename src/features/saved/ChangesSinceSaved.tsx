import { Notice } from '../../components/ui';
import { useOpportunities } from '../../data/content';
import type { SavedPlan } from '../../data/types';
import { useStudent } from '../../hooks/useStudent';
import { diffPlan } from './diff';

/** Shows what changed since the active saved plan was saved. */
export function ChangesSinceSaved({ plan }: { plan: SavedPlan }) {
  const { profile, workspace, goalTypes } = useStudent();
  const opps = useOpportunities();
  const changes = diffPlan(
    plan,
    {
      goalTypeId: profile?.goalTypeId,
      constraints: profile?.constraints,
      opportunityIds: workspace.compareIds,
      timeline: workspace.timeline,
    },
    goalTypes,
    (id) => opps.find((o) => o.id === id)?.title ?? id,
  );
  if (!changes.length) {
    return (
      <Notice tone="success">
        Working from saved plan <strong>“{plan.name}”</strong>. Nothing has changed since it was
        saved.
      </Notice>
    );
  }
  return (
    <Notice tone="caution" title={`Changed since “${plan.name}” was saved`}>
      <ul className="list-disc space-y-0.5 pl-5" data-testid="plan-changes">
        {changes.map((c) => (
          <li key={c.field}>
            <span className="font-medium">{c.field}:</span> {c.before} → {c.after}
          </li>
        ))}
      </ul>
    </Notice>
  );
}
