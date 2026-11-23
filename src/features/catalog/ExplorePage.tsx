import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Notice, PageHeader, buttonClass } from '../../components/ui';
import { useOpportunities } from '../../data/content';
import { updateProfile } from '../../data/profiles';
import { OPPORTUNITY_TYPES, type OpportunityType } from '../../data/types';
import { MAX_COMPARE, toggleCompare } from '../../data/workspace';
import { useStudent } from '../../hooks/useStudent';
import { scoreAll } from '../scoring';
import { OnboardingStepper } from '../shell';
import { DataQualityLegend } from '../transparency';
import { EMPTY_FILTERS, filterOpportunities, type CatalogFilters } from './filter';
import { OpportunityCard } from './OpportunityCard';
import { TYPE_LABELS } from './labels';

export default function ExplorePage() {
  const { user, profile, goal, constraints, workspace } = useStudent();
  const opportunities = useOpportunities();
  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_FILTERS);

  const visible = useMemo(
    () => filterOpportunities(opportunities, { ...filters, goalTypeId: goal?.id }, constraints),
    [opportunities, filters, goal?.id, constraints],
  );
  const results = useMemo(
    () => (goal ? scoreAll(visible, goal, constraints) : {}),
    [visible, goal, constraints],
  );

  if (!user) return null;

  const toggleType = (t: OpportunityType) =>
    setFilters((f) => ({
      ...f,
      types: f.types.includes(t) ? f.types.filter((x) => x !== t) : [...f.types, t],
    }));
  const compareCount = workspace.compareIds.length;
  const onboarding = profile && !profile.onboardingComplete;

  return (
    <div>
      <OnboardingStepper current="explore" />
      <PageHeader
        eyebrow={onboarding ? 'Step 4 · Explore' : 'Explore'}
        title="Opportunity catalog"
        description={
          goal
            ? `Ratings use the “${goal.name}” weightings. The catalog keeps its own order; it is never sorted by rating.`
            : 'Pick a goal to see ratings for each opportunity.'
        }
        actions={
          <Link to="/compare" className={buttonClass('primary')}>
            Compare ({compareCount})
          </Link>
        }
      />

      {onboarding && profile.goalTypeId && profile.constraints && (
        <div className="mb-6">
          <Notice tone="success" title="Setup is complete">
            <p className="mb-2">
              Your profile, goal and constraints are saved. Add 2–4 options to a comparison when you
              are ready.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => updateProfile(user.id, { onboardingComplete: true })}
            >
              Finish setup
            </Button>
          </Notice>
        </div>
      )}
      {!goal && (
        <div className="mb-6">
          <Notice tone="caution">
            No goal selected yet.{' '}
            <Link to="/goal" className="font-medium underline">
              Choose a goal
            </Link>{' '}
            to see ratings.
          </Notice>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <aside aria-label="Filters" className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <Card className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="catalog-search" className="block text-sm font-medium">
                Search
              </label>
              <input
                id="catalog-search"
                type="search"
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                placeholder="e.g. terraform, aws, research"
                className="block min-h-[44px] w-full rounded-lg border border-line-strong bg-paper-raised px-3 py-2"
              />
            </div>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Type</legend>
              <div className="flex flex-wrap gap-2">
                {OPPORTUNITY_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={filters.types.includes(t)}
                    onClick={() => toggleType(t)}
                    className={`min-h-[40px] rounded-full border px-3 text-sm ${
                      filters.types.includes(t)
                        ? 'border-accent bg-accent-soft font-medium text-accent-strong'
                        : 'border-line-strong bg-paper-raised text-ink-soft'
                    }`}
                  >
                    {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </fieldset>
            {constraints && (
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">Your constraints</legend>
                <label className="flex min-h-[40px] items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-accent"
                    checked={filters.withinHours}
                    onChange={(e) => setFilters({ ...filters, withinHours: e.target.checked })}
                  />
                  Within {constraints.weeklyHours} hrs/week
                </label>
                <label className="flex min-h-[40px] items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-accent"
                    checked={filters.withinBudget}
                    onChange={(e) => setFilters({ ...filters, withinBudget: e.target.checked })}
                  />
                  Within ${constraints.budgetUSD} budget
                </label>
              </fieldset>
            )}
            <Button variant="ghost" size="sm" onClick={() => setFilters(EMPTY_FILTERS)}>
              Clear filters
            </Button>
          </Card>
          <DataQualityLegend />
        </aside>

        <section aria-label="Opportunities" className="space-y-4">
          <p className="text-sm text-ink-muted" role="status">
            Showing {visible.length} of {opportunities.length} opportunities
            {compareCount >= MAX_COMPARE
              ? ' · comparison is full (4 of 4)'
              : ` · ${compareCount} of ${MAX_COMPARE} in comparison`}
          </p>
          {visible.length === 0 ? (
            <Notice>No opportunities match these filters. Try clearing a filter.</Notice>
          ) : (
            visible.map((o) => (
              <OpportunityCard
                key={o.id}
                opp={o}
                goal={goal}
                result={results[o.id]}
                inCompare={workspace.compareIds.includes(o.id)}
                compareFull={compareCount >= MAX_COMPARE}
                onToggleCompare={() => toggleCompare(user.id, o.id)}
              />
            ))
          )}
        </section>
      </div>
    </div>
  );
}
