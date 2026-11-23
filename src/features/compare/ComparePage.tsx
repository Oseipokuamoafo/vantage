import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Card,
  EmptyState,
  Notice,
  PageHeader,
  buttonClass,
  inputClass,
} from '../../components/ui';
import { useOpportunities } from '../../data/content';
import { getPlan } from '../../data/plans';
import { MAX_COMPARE, MIN_COMPARE, toggleCompare, updateWorkspace } from '../../data/workspace';
import { useStudent } from '../../hooks/useStudent';
import { formatCost, TYPE_LABELS, TypeMark } from '../catalog';
import { OutcomesPanel } from '../outcomes';
import { ChangesSinceSaved, SavePlanForm } from '../saved';
import { ATTRIBUTE_LABELS, ATTRIBUTE_ORDER, scoreAll } from '../scoring';
import {
  DataQualityLegend,
  FitPanel,
  ScoreWithExplanation,
  SummaryWithExplanation,
} from '../transparency';

export default function ComparePage() {
  const { user, goal, constraints, workspace } = useStudent();
  const opportunities = useOpportunities();
  const [pick, setPick] = useState('');

  // Columns stay in the order the student added them. Never sorted by score.
  const selected = useMemo(
    () =>
      workspace.compareIds
        .map((id) => opportunities.find((o) => o.id === id))
        .filter((o) => o !== undefined),
    [workspace.compareIds, opportunities],
  );
  const results = useMemo(
    () => (goal ? scoreAll(selected, goal, constraints) : {}),
    [selected, goal, constraints],
  );

  if (!user) return null;
  if (!goal) {
    return (
      <EmptyState
        title="Choose a goal first"
        action={
          <Link to="/goal" className={buttonClass('primary')}>
            Choose a goal
          </Link>
        }
      >
        Ratings depend on the goal, so a comparison needs one.
      </EmptyState>
    );
  }

  const available = opportunities.filter(
    (o) => !workspace.compareIds.includes(o.id) && o.goalRelevance[goal.id],
  );
  const full = selected.length >= MAX_COMPARE;
  const activePlan = workspace.activePlanId ? getPlan(user.id, workspace.activePlanId) : undefined;

  function addPicked() {
    if (!pick || !user) return;
    toggleCompare(user.id, pick);
    setPick('');
  }

  // Each opportunity column renders as one white rounded card: cells share a white surface,
  // the first row rounds the top corners and the last row rounds the bottom ones.
  const colCell = (row: 'first' | 'middle' | 'last') =>
    `min-w-[78vw] snap-start bg-surface px-5 align-top sm:min-w-[17rem] ${
      row === 'first' ? 'rounded-t-card pt-6' : row === 'last' ? 'rounded-b-card pb-6' : ''
    } ${row !== 'first' ? 'border-t border-border py-5' : 'pb-5'}`;
  const rowHeader =
    'sticky left-0 z-10 w-28 min-w-[7rem] bg-page py-5 pr-3 text-left align-top text-sm font-bold text-navy sm:w-40';
  const rows: { key: string; label: string; render: (i: number) => JSX.Element }[] = [
    ...ATTRIBUTE_ORDER.map((k) => ({
      key: k,
      label: ATTRIBUTE_LABELS[k],
      render: (i: number) => (
        <ScoreWithExplanation
          attribute={results[selected[i]!.id]!.attributes[k]}
          quality={selected[i]!.dataQuality}
          showLabel={false}
        />
      ),
    })),
    {
      key: 'summary',
      label: 'Weighted summary',
      render: (i) => (
        <SummaryWithExplanation result={results[selected[i]!.id]!} goalName={goal.name} />
      ),
    },
    {
      key: 'fit',
      label: 'Constraint fit',
      render: (i) => <FitPanel result={results[selected[i]!.id]!} />,
    },
    {
      key: 'outcomes',
      label: 'Reported outcomes',
      render: (i) => <OutcomesPanel opportunityId={selected[i]!.id} goalTypeId={goal.id} />,
    },
    {
      key: 'time-cost',
      label: 'Time and cost',
      render: (i) => {
        const o = selected[i]!;
        return (
          <p className="text-sm text-body">
            {o.timeCommitmentHoursPerWeek} h/week for {o.durationWeeks} weeks,{' '}
            {formatCost(o.costUSD)}
          </p>
        );
      },
    },
    {
      key: 'timing',
      label: 'Timing windows',
      render: (i) => {
        const o = selected[i]!;
        return o.timingWindows.length ? (
          <div className="space-y-1 text-sm text-body">
            {o.timingWindows.map((w) => (
              <p key={`${w.label}-${w.season}`}>
                <span className="font-semibold text-navy">{w.label}</span> ({w.season}): {w.note}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-body">No fixed window</p>
        );
      },
    },
    {
      key: 'source',
      label: 'Source',
      render: (i) => <p className="text-sm text-muted">{selected[i]!.source}</p>,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Side-by-side comparison"
        description={
          <>
            Same measures, same order, for 2–4 options under the{' '}
            <strong className="text-navy">{goal.name}</strong> goal. Columns appear in the order you
            added them. Nothing is ranked or highlighted.
          </>
        }
      />

      {activePlan && <ChangesSinceSaved plan={activePlan} />}

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <label htmlFor="compare-pick" className="block text-sm font-semibold text-navy">
              Add an opportunity ({selected.length} of {MAX_COMPARE})
            </label>
            <select
              id="compare-pick"
              value={pick}
              onChange={(e) => setPick(e.target.value)}
              disabled={full}
              className={inputClass}
            >
              <option value="">{full ? 'Comparison is full' : 'Choose from the catalog…'}</option>
              {available.map((o) => (
                <option key={o.id} value={o.id}>
                  {TYPE_LABELS[o.type]}: {o.title}
                </option>
              ))}
            </select>
          </div>
          <Button variant="primary" onClick={addPicked} disabled={!pick || full}>
            Add to comparison
          </Button>
          {selected.length > 0 && (
            <Button
              variant="ghost"
              onClick={() => updateWorkspace(user.id, (ws) => ({ ...ws, compareIds: [] }))}
            >
              Clear all
            </Button>
          )}
        </div>
        {!constraints && (
          <Notice tone="caution">
            <Link to="/constraints" className="font-semibold text-primary underline">
              Add your constraints
            </Link>{' '}
            to see hours, budget and timeline fit.
          </Notice>
        )}
      </Card>

      {selected.length < MIN_COMPARE ? (
        <EmptyState
          title={selected.length === 0 ? 'Nothing to compare yet' : 'Add one more to compare'}
          action={
            <Link to="/explore" className={buttonClass('secondary')}>
              Browse the catalog
            </Link>
          }
        >
          Pick at least {MIN_COMPARE} opportunities above or from the Explore page.
          {selected.length === 1 && ` Currently selected: ${selected[0]!.title}.`}
        </EmptyState>
      ) : (
        <>
          <p className="text-sm text-muted sm:hidden">Swipe sideways to see every column.</p>
          <div
            role="region"
            aria-label="Comparison table, scrolls horizontally"
            tabIndex={0}
            className="relative -mx-4 snap-x snap-mandatory scroll-pl-32 overflow-x-auto px-4 pb-4 sm:mx-0 sm:scroll-pl-44 sm:px-0"
          >
            <table className="w-full border-separate border-spacing-x-3 border-spacing-y-0 text-left [filter:drop-shadow(0_8px_24px_rgba(15,31,75,0.06))]">
              <caption className="sr-only">
                Comparison of {selected.length} opportunities for {goal.name}, in the order added
              </caption>
              <thead>
                <tr>
                  <th scope="col" className={`${rowHeader} align-bottom pb-5 pt-6`}>
                    Attribute
                  </th>
                  {selected.map((o) => (
                    <th key={o.id} scope="col" className={`${colCell('first')} font-normal`}>
                      <div className="space-y-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-primary px-3 py-0.5 text-xs font-semibold text-navy">
                          <TypeMark type={o.type} size={12} />
                          {TYPE_LABELS[o.type]}
                        </span>
                        <p className="text-lg font-extrabold leading-snug text-navy">{o.title}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleCompare(user.id, o.id)}
                        >
                          Remove<span className="sr-only"> {o.title}</span>
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, r) => (
                  <tr key={row.key}>
                    <th
                      scope="row"
                      className={`${rowHeader} ${r === 0 ? '' : 'border-t border-border'}`}
                    >
                      {row.label}
                    </th>
                    {selected.map((o, i) => (
                      <td key={o.id} className={colCell(r === rows.length - 1 ? 'last' : 'middle')}>
                        {row.render(i)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DataQualityLegend />
          <Card className="space-y-3">
            <h2 className="text-xl font-extrabold">Save this comparison</h2>
            <p className="text-sm text-body">
              Saves your goal, constraints, these {selected.length} opportunities and your semester
              plan, so you can reopen them later.
            </p>
            <SavePlanForm />
          </Card>
        </>
      )}
    </div>
  );
}
