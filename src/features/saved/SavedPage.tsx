import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, EmptyState, PageHeader, buttonClass } from '../../components/ui';
import { useOpportunities } from '../../data/content';
import { deletePlan, renamePlan, usePlans } from '../../data/plans';
import { updateProfile } from '../../data/profiles';
import type { SavedPlan } from '../../data/types';
import { updateWorkspace } from '../../data/workspace';
import { useStudent } from '../../hooks/useStudent';
import { diffPlan } from './diff';

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

function PlanCard({ plan }: { plan: SavedPlan }) {
  const { user, profile, workspace, goalTypes } = useStudent();
  const opps = useOpportunities();
  const navigate = useNavigate();
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(plan.name);
  const [nameError, setNameError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  if (!user) return null;

  const titleOf = (id: string) =>
    opps.find((o) => o.id === id)?.title ?? `${id} (removed from catalog)`;
  const isActive = workspace.activePlanId === plan.id;
  const changes = diffPlan(
    plan,
    {
      goalTypeId: profile?.goalTypeId,
      constraints: profile?.constraints,
      opportunityIds: isActive ? workspace.compareIds : plan.opportunityIds,
      timeline: isActive ? workspace.timeline : plan.timeline,
    },
    goalTypes,
    titleOf,
  );
  const goalName = goalTypes.find((g) => g.id === plan.goalTypeId)?.name ?? plan.goalTypeId;
  const headingId = `plan-${plan.id}`;

  function open(target: '/compare' | '/plan') {
    updateWorkspace(user!.id, (ws) => ({
      ...ws,
      compareIds: plan.opportunityIds.filter((id) => opps.some((o) => o.id === id)),
      timeline: plan.timeline,
      activePlanId: plan.id,
    }));
    navigate(target);
  }

  function restoreGoalAndConstraints() {
    updateProfile(user!.id, { goalTypeId: plan.goalTypeId, constraints: plan.constraints });
  }

  function onRename(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 80) {
      setNameError('Use 1–80 characters.');
      return;
    }
    renamePlan(user!.id, plan.id, trimmed);
    setNameError(null);
    setRenaming(false);
  }

  return (
    <Card as="li" aria-labelledby={headingId} className="space-y-3" data-testid="saved-plan">
      {renaming ? (
        <form
          onSubmit={onRename}
          className="flex flex-col gap-2 sm:flex-row sm:items-end"
          noValidate
        >
          <div className="flex-1 space-y-1">
            <label htmlFor={`rename-${plan.id}`} className="block text-sm font-medium">
              Plan name
            </label>
            <input
              id={`rename-${plan.id}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={nameError ? true : undefined}
              className="block min-h-[44px] w-full rounded-lg border border-line-strong bg-paper-raised px-3"
            />
            {nameError && <p className="text-sm text-alert">{nameError}</p>}
          </div>
          <Button type="submit" variant="primary">
            Save name
          </Button>
          <Button
            onClick={() => {
              setRenaming(false);
              setName(plan.name);
            }}
          >
            Cancel
          </Button>
        </form>
      ) : (
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id={headingId} className="text-xl font-extrabold">
            {plan.name}
          </h2>
          <p className="text-xs text-ink-muted">
            Saved {fmtDate(plan.createdAt)}
            {plan.updatedAt !== plan.createdAt && `, updated ${fmtDate(plan.updatedAt)}`}
          </p>
        </div>
      )}
      <dl className="grid gap-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-ink-muted">Goal</dt>
          <dd>{goalName}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Constraints when saved</dt>
          <dd>
            {plan.constraints.weeklyHours} h/week, ${plan.constraints.budgetUSD},{' '}
            {plan.constraints.semestersRemaining} semesters
          </dd>
        </div>
        <div>
          <dt className="text-ink-muted">Opportunities</dt>
          <dd>
            {plan.opportunityIds.length ? plan.opportunityIds.map(titleOf).join('; ') : 'None'}
          </dd>
        </div>
      </dl>
      {changes.length > 0 ? (
        <div className="rounded-lg border border-caution/30 bg-caution-soft p-3 text-sm">
          <p className="font-semibold">Changed since saved</p>
          <ul className="list-disc pl-5">
            {changes.map((c) => (
              <li key={c.field}>
                <span className="font-medium">{c.field}:</span> {c.before} → {c.after}
              </li>
            ))}
          </ul>
          <p className="mt-1 text-ink-soft">
            Opening the plan re-runs ratings with your current goal and constraints.
          </p>
        </div>
      ) : (
        <p className="text-sm text-ink-muted">
          Your current goal and constraints match this saved plan.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="sm" onClick={() => open('/compare')}>
          Open comparison<span className="sr-only">: {plan.name}</span>
        </Button>
        <Button size="sm" onClick={() => open('/plan')}>
          Open semester plan<span className="sr-only">: {plan.name}</span>
        </Button>
        {changes.some((c) => c.field === 'Goal' || /hours|Budget|Semesters/.test(c.field)) && (
          <Button size="sm" onClick={restoreGoalAndConstraints}>
            Restore saved goal and constraints
          </Button>
        )}
        {!renaming && (
          <Button size="sm" variant="ghost" onClick={() => setRenaming(true)}>
            Rename<span className="sr-only"> {plan.name}</span>
          </Button>
        )}
        {confirmDelete ? (
          <>
            <Button size="sm" variant="danger" onClick={() => deletePlan(user.id, plan.id)}>
              Confirm delete
            </Button>
            <Button size="sm" onClick={() => setConfirmDelete(false)}>
              Keep plan
            </Button>
          </>
        ) : (
          <Button size="sm" variant="danger" onClick={() => setConfirmDelete(true)}>
            Delete<span className="sr-only"> {plan.name}</span>
          </Button>
        )}
      </div>
    </Card>
  );
}

export default function SavedPage() {
  const { user } = useStudent();
  const plans = usePlans(user?.id);
  if (!user) return null;
  return (
    <div>
      <PageHeader
        title="Saved plans"
        description="Each plan keeps its goal, constraints, compared opportunities and semester layout. Plans stay here when you log out or edit your profile."
      />
      {plans.length === 0 ? (
        <EmptyState
          title="No saved plans yet"
          action={
            <Link to="/compare" className={buttonClass('primary')}>
              Go to Compare
            </Link>
          }
        >
          Save a comparison or semester plan to reopen it later.
        </EmptyState>
      ) : (
        <ul className="space-y-4">
          {plans.map((p) => (
            <PlanCard key={p.id} plan={p} />
          ))}
        </ul>
      )}
    </div>
  );
}
