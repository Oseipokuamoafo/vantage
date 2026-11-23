import { useState, type FormEvent } from 'react';
import { Button } from '../../components/ui';
import { createPlan, getPlan, updatePlan } from '../../data/plans';
import { updateWorkspace } from '../../data/workspace';
import { useStudent } from '../../hooks/useStudent';

/** Saves the current goal, constraints, comparison and timeline as a named plan. */
export function SavePlanForm() {
  const { user, profile, workspace } = useStudent();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!user || !profile?.goalTypeId || !profile.constraints) return null;
  const active = workspace.activePlanId ? getPlan(user.id, workspace.activePlanId) : undefined;

  const snapshot = () => ({
    goalTypeId: profile.goalTypeId!,
    constraints: profile.constraints!,
    opportunityIds: workspace.compareIds,
    timeline: workspace.timeline,
  });

  function onSaveNew(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Give the plan a name.');
      return;
    }
    if (trimmed.length > 80) {
      setError('Use 80 characters or fewer.');
      return;
    }
    const plan = createPlan(user!.id, { name: trimmed, ...snapshot() });
    updateWorkspace(user!.id, (ws) => ({ ...ws, activePlanId: plan.id }));
    setError(null);
    setName('');
    setMessage(`Saved “${plan.name}”.`);
  }

  function onUpdate() {
    if (!active) return;
    updatePlan(user!.id, active.id, snapshot());
    setMessage(`Updated “${active.name}”.`);
  }

  return (
    <form onSubmit={onSaveNew} noValidate className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-1">
        <label htmlFor="plan-name" className="block text-sm font-medium">
          Save as a new plan
        </label>
        <input
          id="plan-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setMessage(null);
          }}
          placeholder="e.g. Spring cloud plan"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'plan-name-error' : undefined}
          className="block min-h-[44px] w-full rounded-lg border border-line-strong bg-paper-raised px-3 py-2"
        />
        {error && (
          <p id="plan-name-error" className="text-sm font-medium text-alert">
            {error}
          </p>
        )}
      </div>
      <Button type="submit" variant="primary">
        Save plan
      </Button>
      {active && (
        <Button onClick={onUpdate}>
          Update “{active.name.length > 24 ? `${active.name.slice(0, 24)}…` : active.name}”
        </Button>
      )}
      <p role="status" className="text-sm text-accent-strong sm:self-center">
        {message}
      </p>
    </form>
  );
}
