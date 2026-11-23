import { useMemo, useState } from 'react';
import {
  OPPORTUNITY_TYPES,
  type GoalType,
  type Opportunity,
  type OpportunityType,
} from '../../data/types';
import { scoreOpportunity } from '../scoring';
import { DataQualityBadge } from '../transparency';
import { TYPE_LABELS, formatCost } from './labels';
import { TypeMark } from './TypeMark';
import { shapePath, TYPE_COLORS } from './typeShapes';

const W = 640;
const H = 380;
const M = { top: 18, right: 18, bottom: 54, left: 54 };
const X_MAX = 600;
const X_TICKS = [0, 50, 100, 200, 400, 600];
const Y_TICKS = [0, 2.5, 5, 7.5, 10];

// Square-root scale spreads out the many short options without hiding the long ones.
const xPos = (hours: number) =>
  M.left + (Math.sqrt(Math.min(hours, X_MAX)) / Math.sqrt(X_MAX)) * (W - M.left - M.right);
const yPos = (skill: number) => H - M.bottom - (skill / 10) * (H - M.top - M.bottom);

// Decorative contour lines behind the plot (drawn once on load in the hero).
const CONTOURS = [
  'M40 300 C140 250 220 330 330 270 S520 210 640 250',
  'M40 240 C150 190 230 270 340 210 S520 150 640 190',
  'M40 180 C160 130 240 210 350 150 S530 90 640 130',
  'M40 120 C170 80 250 150 360 95 S540 40 640 75',
];

interface Props {
  opportunities: Opportunity[];
  goal: GoalType;
  /** Ids shown with a ring (e.g. already in the comparison). */
  selectedIds?: string[];
  /** Called when a marker is clicked or activated with Enter/Space. */
  onActivate?: (id: string) => void;
  activateHint?: string;
  animate?: boolean;
}

export function TradeoffMap({
  opportunities,
  goal,
  selectedIds = [],
  onActivate,
  activateHint,
  animate = false,
}: Props) {
  const [hidden, setHidden] = useState<OpportunityType[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  const points = useMemo(() => {
    const placed: {
      o: Opportunity;
      x: number;
      y: number;
      hours: number;
      r: ReturnType<typeof scoreOpportunity>;
    }[] = [];
    for (const o of opportunities) {
      const r = scoreOpportunity(o, goal);
      const hours = o.timeCommitmentHoursPerWeek * o.durationWeeks;
      let x = xPos(hours);
      const y = yPos(r.attributes.skill.score);
      // Nudge overlapping markers sideways so each stays reachable.
      while (placed.some((p) => Math.hypot(p.x - x, p.y - y) < 20)) x += 20;
      placed.push({ o, x, y, hours, r });
    }
    return placed;
  }, [opportunities, goal]);

  const visible = points.filter((p) => !hidden.includes(p.o.type));
  const shownId = activeId ?? pinnedId;
  const shown = visible.find((p) => p.o.id === shownId);
  const counts = Object.fromEntries(
    OPPORTUNITY_TYPES.map((t) => [t, points.filter((p) => p.o.type === t).length]),
  );

  const toggleType = (t: OpportunityType) =>
    setHidden((h) => (h.includes(t) ? h.filter((x) => x !== t) : [...h, t]));

  return (
    <figure className="space-y-3">
      <div
        className="flex flex-wrap gap-1.5"
        role="group"
        aria-label="Show or hide opportunity types"
      >
        {OPPORTUNITY_TYPES.filter((t) => counts[t]).map((t) => {
          const on = !hidden.includes(t);
          return (
            <button
              key={t}
              type="button"
              aria-pressed={on}
              onClick={() => toggleType(t)}
              className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border px-2.5 text-sm font-medium transition ${
                on
                  ? 'border-line-strong bg-paper-raised text-ink hover:border-ink'
                  : 'border-dashed border-line-strong text-ink-muted line-through opacity-70 hover:opacity-100'
              }`}
            >
              <TypeMark type={t} />
              {TYPE_LABELS[t]}
              <span className="tabular text-ink-muted">{counts[t]}</span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-ink-muted sm:hidden">Swipe sideways to see the whole map.</p>
      <div
        className="relative -mx-1 overflow-x-auto px-1 pb-1"
        role="region"
        aria-label="Trade-off map, scrolls horizontally on small screens"
        tabIndex={-1}
      >
        <div className="relative min-w-[540px]">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="block h-auto w-full select-none"
            role="group"
            aria-label={`Trade-off map for ${goal.name}: total hours across, skill development up`}
          >
            <g aria-hidden="true">
              {CONTOURS.map((d, i) => (
                <path
                  key={d}
                  d={d}
                  pathLength={1}
                  fill="none"
                  stroke="#d3dcd7"
                  strokeWidth={1.2}
                  strokeDasharray={animate ? 1 : undefined}
                  className={animate ? 'animate-draw' : undefined}
                  style={animate ? { animationDelay: `${i * 120}ms` } : undefined}
                />
              ))}
              {Y_TICKS.map((t) => (
                <g key={t}>
                  <line
                    x1={M.left}
                    x2={W - M.right}
                    y1={yPos(t)}
                    y2={yPos(t)}
                    stroke="#e7ece8"
                    strokeWidth={1}
                  />
                  <text
                    x={M.left - 10}
                    y={yPos(t)}
                    dy="0.32em"
                    textAnchor="end"
                    className="fill-ink-muted text-[11px] tabular"
                  >
                    {t}
                  </text>
                </g>
              ))}
              {X_TICKS.map((t) => (
                <text
                  key={t}
                  x={xPos(t)}
                  y={H - M.bottom + 20}
                  textAnchor="middle"
                  className="fill-ink-muted text-[11px] tabular"
                >
                  {t}
                </text>
              ))}
              <line
                x1={M.left}
                x2={W - M.right}
                y1={H - M.bottom}
                y2={H - M.bottom}
                stroke="#a9b8b1"
              />
              <text
                x={(M.left + W - M.right) / 2}
                y={H - 10}
                textAnchor="middle"
                className="fill-ink-soft text-[12px] font-semibold"
              >
                Total hours (hours per week × weeks)
              </text>
              <text
                transform={`translate(14 ${(M.top + H - M.bottom) / 2}) rotate(-90)`}
                textAnchor="middle"
                className="fill-ink-soft text-[12px] font-semibold"
              >
                Skill development (0–10)
              </text>
            </g>

            {visible.map((p, i) => {
              const isActive = p.o.id === shownId;
              const dimmed = shownId !== null && !isActive;
              const selected = selectedIds.includes(p.o.id);
              const label = `${p.o.title}. ${TYPE_LABELS[p.o.type]}. About ${Math.round(p.hours)} total hours. Skill development ${p.r.attributes.skill.score.toFixed(1)} out of 10.${selected ? ' In comparison.' : ''}${activateHint ? ` ${activateHint}` : ''}`;
              const activate = () => {
                if (onActivate) onActivate(p.o.id);
                else setPinnedId((cur) => (cur === p.o.id ? null : p.o.id));
              };
              return (
                <g
                  key={p.o.id}
                  transform={`translate(${p.x} ${p.y})`}
                  tabIndex={0}
                  role="button"
                  aria-label={label}
                  aria-pressed={onActivate ? selected : undefined}
                  onMouseEnter={() => setActiveId(p.o.id)}
                  onMouseLeave={() => setActiveId(null)}
                  onFocus={() => setActiveId(p.o.id)}
                  onBlur={() => setActiveId(null)}
                  onClick={activate}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      activate();
                    } else if (e.key === 'Escape') {
                      setPinnedId(null);
                      (e.currentTarget as SVGGElement).blur();
                    }
                  }}
                  className="cursor-pointer outline-none [&:focus-visible_.focus-ring]:opacity-100"
                >
                  <circle r={10} fill="transparent" />
                  <circle
                    className="focus-ring opacity-0"
                    pointerEvents="none"
                    r={13}
                    fill="none"
                    stroke="#1f4fd8"
                    strokeWidth={3}
                  />
                  {selected && (
                    <circle
                      pointerEvents="none"
                      r={11.5}
                      fill="none"
                      stroke="#0f2a26"
                      strokeWidth={2}
                    />
                  )}
                  <g
                    pointerEvents="none"
                    className={`transition-[transform,opacity] duration-200 ease-out [transform-box:fill-box] [transform-origin:center] ${animate ? 'animate-pop' : ''}`}
                    style={{
                      transform: isActive ? 'scale(1.45)' : undefined,
                      opacity: dimmed ? 0.3 : 1,
                      animationDelay: animate ? `${500 + i * 35}ms` : undefined,
                    }}
                  >
                    <path
                      d={shapePath(p.o.type, 7)}
                      fill={TYPE_COLORS[p.o.type]}
                      stroke="#ffffff"
                      strokeWidth={2}
                      strokeLinejoin="round"
                      paintOrder="stroke"
                    />
                    <path
                      d={shapePath(p.o.type, 7)}
                      fill="none"
                      stroke="#0f2a26"
                      strokeOpacity={0.55}
                      strokeWidth={0.8}
                      strokeLinejoin="round"
                    />
                  </g>
                </g>
              );
            })}
          </svg>

          {shown && (
            <div
              className="pointer-events-none absolute z-10 w-64 rounded-xl border border-line bg-paper-raised p-3 text-sm shadow-lift"
              style={{
                left: `${(shown.x / W) * 100}%`,
                top: `${(shown.y / H) * 100}%`,
                transform: `translate(${shown.x / W > 0.58 ? 'calc(-100% - 16px)' : '16px'}, ${shown.y / H < 0.4 ? '0' : '-100%'})`,
              }}
              role="status"
            >
              <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
                <TypeMark type={shown.o.type} />
                {TYPE_LABELS[shown.o.type]}
              </p>
              <p className="mt-0.5 font-bold leading-snug text-ink">{shown.o.title}</p>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-ink-soft">
                <dt>Total time</dt>
                <dd className="tabular text-ink">
                  {Math.round(shown.hours)} h ({shown.o.timeCommitmentHoursPerWeek} h/week,{' '}
                  {shown.o.durationWeeks} wk)
                </dd>
                <dt>Cost</dt>
                <dd className="text-ink">{formatCost(shown.o.costUSD)}</dd>
                <dt>Skill</dt>
                <dd className="tabular font-bold text-ink">
                  {shown.r.attributes.skill.score.toFixed(1)} / 10
                </dd>
              </dl>
              <p className="mt-1.5 text-ink-soft">
                <span className="font-semibold text-ink">Driven by:</span>{' '}
                {shown.r.attributes.skill.summary}
              </p>
              <div className="mt-2">
                <DataQualityBadge quality={shown.o.dataQuality} />
              </div>
            </div>
          )}
        </div>
      </div>

      <figcaption className="text-sm text-ink-muted">
        Position shows trade-offs, not quality: lighter commitments sit to the left, broader
        coverage of this goal’s skills sits higher. Overlapping markers are nudged apart slightly.
      </figcaption>

      <details className="disclosure text-sm">
        <summary className="font-semibold text-accent-strong">Show the map as a table</summary>
        <div
          className="relative mt-2 overflow-x-auto rounded-xl border border-line"
          role="region"
          aria-label="Trade-off map data"
          tabIndex={0}
        >
          <table className="w-full min-w-[30rem] text-left">
            <thead className="bg-paper-sunk">
              <tr>
                <th scope="col" className="p-2">
                  Opportunity
                </th>
                <th scope="col" className="p-2">
                  Type
                </th>
                <th scope="col" className="p-2 text-right">
                  Total hours
                </th>
                <th scope="col" className="p-2 text-right">
                  Skill (0–10)
                </th>
                <th scope="col" className="p-2">
                  Data quality
                </th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.o.id} className="border-t border-line">
                  <td className="p-2">{p.o.title}</td>
                  <td className="p-2">{TYPE_LABELS[p.o.type]}</td>
                  <td className="tabular p-2 text-right">{Math.round(p.hours)}</td>
                  <td className="tabular p-2 text-right">
                    {p.r.attributes.skill.score.toFixed(1)}
                  </td>
                  <td className="p-2">
                    <DataQualityBadge quality={p.o.dataQuality} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
