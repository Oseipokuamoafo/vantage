import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Notice, PageHeader, buttonClass, inputClass } from '../../components/ui';
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
import { TradeoffMap } from './TradeoffMap';
import { TYPE_LABELS } from './labels';
import { TypeMark } from './TypeMark';

export default function ExplorePage() {
  const { user, profile, goal, constraints, workspace } = useStudent();
  const opportunities = useOpportunities();
  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_FILTERS);
  const [view, setView] = useState<'list' | 'map'>('list');

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
        eyebrow={onboarding ? 'Step 4 of 4' : undefined}
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
                className={inputClass}
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
                    className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border px-2.5 text-sm font-medium transition ${
                      filters.types.includes(t)
                        ? 'border-ink bg-ink text-white'
                        : 'border-line-strong bg-paper-raised text-ink-soft hover:border-ink hover:text-ink'
                    }`}
                  >
                    <TypeMark type={t} />
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

        <section aria-label="Opportunities" className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-muted" role="status">
              Showing {visible.length} of {opportunities.length} opportunities, {compareCount} of{' '}
              {MAX_COMPARE} in comparison
            </p>
            {goal && (
              <div
                className="inline-flex rounded-xl border border-line-strong bg-paper-raised p-1"
                role="group"
                aria-label="View"
              >
                {(['list', 'map'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={view === v}
                    onClick={() => setView(v)}
                    className={`min-h-[36px] rounded-lg px-3 text-sm font-semibold transition ${
                      view === v
                        ? 'bg-ink text-white'
                        : 'text-ink-soft hover:bg-paper-sunk hover:text-ink'
                    }`}
                  >
                    {v === 'list' ? 'List' : 'Map'}
                  </button>
                ))}
              </div>
            )}
          </div>
          {visible.length === 0 ? (
            <Notice>No opportunities match these filters. Try clearing a filter.</Notice>
          ) : view === 'map' && goal ? (
            <Card className="p-3 sm:p-6">
              <p className="mb-3 text-sm text-ink-soft">
                Select a marker to add it to the comparison or take it out. A dark ring marks
                options already in it.
              </p>
              <TradeoffMap
                opportunities={visible}
                goal={goal}
                selectedIds={workspace.compareIds}
                onActivate={(id) => {
                  if (workspace.compareIds.includes(id) || compareCount < MAX_COMPARE)
                    toggleCompare(user.id, id);
                }}
                activateHint="Press Enter to add to or remove from the comparison."
              />
            </Card>
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
