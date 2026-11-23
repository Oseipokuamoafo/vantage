import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
} from '@dnd-kit/core';
import { Badge, Button, Card, EmptyState, PageHeader, buttonClass } from '../../components/ui';
import { useOpportunities } from '../../data/content';
import { getPlan } from '../../data/plans';
import type { Opportunity } from '../../data/types';
import { updateWorkspace } from '../../data/workspace';
import { useStudent } from '../../hooks/useStudent';
import { TYPE_LABELS } from '../catalog';
import { ChangesSinceSaved, SavePlanForm } from '../saved';
import {
  flagsForTerm,
  moveItem,
  placedIds,
  termHours,
  TRAY,
  upcomingTerms,
  type Term,
  type TermFlag,
} from './planner';

const FLAG_STYLE: Record<
  TermFlag['kind'],
  { tone: 'alert' | 'accent' | 'caution' | 'neutral'; label: string }
> = {
  overload: { tone: 'alert', label: 'Over hours' },
  window: { tone: 'accent', label: 'Timing window' },
  off_window: { tone: 'caution', label: 'Outside usual window' },
  reminder: { tone: 'neutral', label: 'Related window' },
};

interface ItemProps {
  opp: Opportunity;
  containers: { id: string; label: string }[];
  current: string;
  onMove: (to: string) => void;
}

function PlanItem({ opp, containers, current, onMove }: ItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: opp.id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;
  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border border-line bg-paper-raised p-2 ${isDragging ? 'relative z-20 shadow-lg ring-2 ring-accent' : ''}`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="flex min-h-[44px] min-w-[44px] shrink-0 cursor-grab touch-none items-center justify-center rounded-md border border-line text-ink-muted hover:bg-paper-sunk"
          aria-label={`Drag ${opp.title}`}
          {...listeners}
          {...attributes}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
            <circle cx="5" cy="3" r="1.5" />
            <circle cx="11" cy="3" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="13" r="1.5" />
            <circle cx="11" cy="13" r="1.5" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug">{opp.title}</p>
          <p className="text-xs text-ink-muted">
            {TYPE_LABELS[opp.type]} · {opp.timeCommitmentHoursPerWeek} hrs/week ·{' '}
            {opp.durationWeeks} wk
          </p>
          <label className="mt-1 flex items-center gap-2 text-xs">
            <span className="text-ink-soft">Move to</span>
            <select
              value={current}
              onChange={(e) => onMove(e.target.value)}
              className="min-h-[36px] rounded-md border border-line-strong bg-paper-raised px-2 text-xs"
              aria-label={`Move ${opp.title} to`}
            >
              {containers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </li>
  );
}

function Column({
  id,
  children,
  className = '',
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'ring-2 ring-accent ring-offset-2 ring-offset-paper' : ''}`}
    >
      {children}
    </div>
  );
}

export default function PlanPage() {
  const { user, profile, constraints, workspace } = useStudent();
  const opportunities = useOpportunities();
  const [extra, setExtra] = useState('');
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const terms = useMemo(
    () => (constraints ? upcomingTerms(constraints.semestersRemaining) : []),
    [constraints],
  );
  const byId = useMemo(() => new Map(opportunities.map((o) => [o.id, o])), [opportunities]);

  if (!user) return null;
  if (!constraints) {
    return (
      <EmptyState
        title="Add your constraints first"
        action={
          <Link to="/constraints" className={buttonClass('primary')}>
            Set constraints
          </Link>
        }
      >
        The planner uses your semesters remaining and weekly hours.
      </EmptyState>
    );
  }

  const timeline = workspace.timeline;
  const placed = placedIds(timeline, terms);
  const trayIds = [...new Set([...workspace.compareIds, ...(timeline[TRAY] ?? [])])].filter(
    (id) => !placed.has(id) && byId.has(id),
  );
  const containers = [
    { id: TRAY, label: 'Tray (unplanned)' },
    ...terms.map((t) => ({ id: t.id, label: t.label })),
  ];
  const labelOf = (id: string) => containers.find((c) => c.id === id)?.label ?? id;
  const titleOf = (id: string | number) => byId.get(String(id))?.title ?? String(id);

  const move = (oppId: string, to: string) =>
    updateWorkspace(user.id, (ws) => ({ ...ws, timeline: moveItem(ws.timeline, oppId, to) }));

  function onDragEnd(e: DragEndEvent) {
    if (e.over) move(String(e.active.id), String(e.over.id));
  }

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${titleOf(active.id)}.`,
    onDragOver: ({ active, over }) =>
      over
        ? `${titleOf(active.id)} is over ${labelOf(String(over.id))}.`
        : `${titleOf(active.id)} is not over a semester.`,
    onDragEnd: ({ active, over }) =>
      over
        ? `${titleOf(active.id)} placed in ${labelOf(String(over.id))}.`
        : `${titleOf(active.id)} was not moved.`,
    onDragCancel: ({ active }) => `Moving ${titleOf(active.id)} was cancelled.`,
  };

  const extras = opportunities.filter(
    (o) =>
      !trayIds.includes(o.id) &&
      !placed.has(o.id) &&
      (!profile?.goalTypeId || o.goalRelevance[profile.goalTypeId]),
  );
  const activePlan = workspace.activePlanId ? getPlan(user.id, workspace.activePlanId) : undefined;
  const renderTerm = (t: Term) => {
    const ids = (timeline[t.id] ?? []).filter((id) => byId.has(id));
    const items = ids.map((id) => byId.get(id)!);
    const flags = flagsForTerm(t, items, constraints.weeklyHours);
    const hours = termHours(items);
    const over = hours > constraints.weeklyHours;
    return (
      <Column key={t.id} id={t.id} className="rounded-xl">
        <Card
          as="section"
          aria-labelledby={`term-${t.id}`}
          className={`h-full space-y-3 ${over ? 'border-alert/50' : ''}`}
          data-testid={`term-${t.id}`}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id={`term-${t.id}`} className="font-display text-lg font-semibold">
              {t.label}
            </h2>
            <span
              className={`text-sm tabular-nums ${over ? 'font-semibold text-alert' : 'text-ink-muted'}`}
            >
              {hours} / {constraints.weeklyHours} hrs/week
            </span>
          </div>
          {items.length ? (
            <ul className="space-y-2">
              {items.map((o) => (
                <PlanItem
                  key={o.id}
                  opp={o}
                  containers={containers}
                  current={t.id}
                  onMove={(to) => move(o.id, to)}
                />
              ))}
            </ul>
          ) : (
            <p className="rounded-lg border border-dashed border-line-strong p-3 text-center text-sm text-ink-muted">
              Drop an opportunity here
            </p>
          )}
          {flags.length > 0 && (
            <ul className="space-y-1.5" aria-label={`Notes for ${t.label}`}>
              {flags.map((f) => (
                <li key={f.text} className="text-xs text-ink-soft">
                  <Badge tone={FLAG_STYLE[f.kind].tone} className="mr-1">
                    {FLAG_STYLE[f.kind].label}
                  </Badge>
                  {f.text}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </Column>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Plan"
        title="Semester-by-semester plan"
        description={`${constraints.semestersRemaining} semesters remaining with summers in between. Drag items with a mouse or touch, or focus the handle and use Space and the arrow keys. Every item also has a “Move to” menu.`}
        actions={
          <Button
            variant="ghost"
            onClick={() => updateWorkspace(user.id, (ws) => ({ ...ws, timeline: {} }))}
          >
            Clear plan
          </Button>
        }
      />
      {activePlan && <ChangesSinceSaved plan={activePlan} />}

      <DndContext
        sensors={sensors}
        onDragEnd={onDragEnd}
        accessibility={{
          announcements,
          screenReaderInstructions: {
            draggable:
              'To pick up an opportunity, press Space or Enter. Use the arrow keys to move it over a semester, then press Space or Enter to drop it, or Escape to cancel. The Move to menu does the same without dragging.',
          },
        }}
      >
        <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
          <Column id={TRAY} className="rounded-xl lg:sticky lg:top-4 lg:self-start">
            <Card as="section" aria-labelledby="tray-heading" className="space-y-3">
              <h2 id="tray-heading" className="font-display text-lg font-semibold">
                Tray
              </h2>
              <p className="text-sm text-ink-soft">
                Items from your comparison, plus any you add here.
              </p>
              {trayIds.length ? (
                <ul className="space-y-2">
                  {trayIds.map((id) => (
                    <PlanItem
                      key={id}
                      opp={byId.get(id)!}
                      containers={containers}
                      current={TRAY}
                      onMove={(to) => move(id, to)}
                    />
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-muted">
                  Everything is placed. Drag an item back here to unplan it.
                </p>
              )}
              <div className="space-y-1 border-t border-line pt-3">
                <label htmlFor="tray-add" className="block text-sm font-medium">
                  Add from the catalog
                </label>
                <div className="flex gap-2">
                  <select
                    id="tray-add"
                    value={extra}
                    onChange={(e) => setExtra(e.target.value)}
                    className="min-h-[44px] w-full min-w-0 rounded-lg border border-line-strong bg-paper-raised px-2 text-sm"
                  >
                    <option value="">Choose…</option>
                    {extras.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.title}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    disabled={!extra}
                    onClick={() => {
                      move(extra, TRAY);
                      setExtra('');
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
              {placed.size > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    updateWorkspace(user.id, (ws) => ({
                      ...ws,
                      timeline: [...placed].reduce((tl, id) => moveItem(tl, id, TRAY), ws.timeline),
                    }))
                  }
                >
                  Unplan everything
                </Button>
              )}
            </Card>
          </Column>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{terms.map(renderTerm)}</div>
        </div>
      </DndContext>

      <Card className="space-y-2">
        <h2 className="font-display text-xl font-semibold">Save this plan</h2>
        <SavePlanForm />
      </Card>
    </div>
  );
}
