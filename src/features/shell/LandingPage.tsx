import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Notice, buttonClass } from '../../components/ui';
import { useOpportunities } from '../../data/content';
import { useStudent } from '../../hooks/useStudent';
import { TradeoffMap } from '../catalog';
import { PERSONAS, startPersona } from './personas';

const MEASURES = [
  {
    name: 'Time commitment',
    body: 'Total hours an option asks of you, set against the hours you have each week.',
  },
  {
    name: 'Skill development',
    body: 'Which of your goal’s target skills it builds, and how many.',
  },
  {
    name: 'Signaling value',
    body: 'How recruiters and programs tend to read it on an application.',
  },
];

const STEPS = [
  ['Profile', 'Year, major and institution. Optional background fields stay in your browser.'],
  ['Goal', 'Pick a target outcome, such as a cloud engineering internship.'],
  ['Constraints', 'Weekly hours, budget and semesters remaining.'],
  [
    'Explore and compare',
    'Filter the catalog, compare 2–4 options, then lay them out by semester.',
  ],
];

export function LandingPage() {
  const { user, profile, goalTypes } = useStudent();
  const opportunities = useOpportunities();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const heroGoal = goalTypes.find((g) => g.status === 'active') ?? goalTypes[0];
  const heroOpps = heroGoal
    ? opportunities.filter((o) => (o.goalRelevance[heroGoal.id]?.signaling ?? 0) >= 2)
    : [];

  async function tryPersona(id: string) {
    const persona = PERSONAS.find((p) => p.id === id);
    if (!persona) return;
    setBusy(id);
    setError(null);
    try {
      await startPersona(persona);
      navigate(persona.compareIds.length ? '/compare' : '/explore');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start the demo persona.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-20">
      <section
        className="grid grid-cols-[minmax(0,1fr)] items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
        aria-labelledby="hero-heading"
      >
        <div className="space-y-6 lg:pt-6">
          <h1
            id="hero-heading"
            className="text-[2.6rem] font-black leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-[3.6rem]"
          >
            See the trade‑offs before you spend a semester on them.
          </h1>
          <p className="max-w-[46ch] text-lg leading-relaxed text-ink-soft">
            Vantage lays out certifications, side projects, student orgs, internships and research
            programs on the same three measures, against your goal, your hours and your budget. You
            make the call.
          </p>
          <div className="flex flex-wrap gap-3">
            {user ? (
              <Link
                to={profile?.onboardingComplete ? '/explore' : '/profile'}
                className={buttonClass('primary')}
              >
                {profile?.onboardingComplete ? 'Open the catalog' : 'Continue setup'}
              </Link>
            ) : (
              <>
                <Link to="/signup" className={buttonClass('primary')}>
                  Create a free account
                </Link>
                <Link to="/login" className={buttonClass('secondary')}>
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
        {heroGoal && (
          <div className="rounded-hero border border-line bg-paper-raised p-4 shadow-lift sm:p-6">
            <div className="mb-3">
              <h2 className="text-lg font-bold">The {heroGoal.name.toLowerCase()} terrain</h2>
              <p className="text-sm text-ink-soft">
                {heroOpps.length} options from the sample catalog. Hover, tap or tab through the
                markers.
              </p>
            </div>
            <TradeoffMap opportunities={heroOpps} goal={heroGoal} animate />
          </div>
        )}
      </section>

      <section aria-labelledby="measures-heading" className="space-y-6">
        <h2 id="measures-heading" className="text-2xl font-extrabold sm:text-3xl">
          Every option, on the same three measures
        </h2>
        <dl className="grid gap-6 sm:grid-cols-3">
          {MEASURES.map((m) => (
            <div key={m.name} className="border-t-[3px] border-ink pt-3">
              <dt className="text-lg font-bold">{m.name}</dt>
              <dd className="mt-1 text-ink-soft">{m.body}</dd>
            </div>
          ))}
        </dl>
        <p className="text-sm text-ink-muted">
          Each rating shows what drove it and how reliable the underlying data is.
        </p>
      </section>

      <section aria-labelledby="personas-heading" className="space-y-6">
        <div className="space-y-1">
          <h2 id="personas-heading" className="text-2xl font-extrabold sm:text-3xl">
            Try it as a sample student
          </h2>
          <p className="text-ink-soft">
            One click signs you in with a prefilled profile, goal and constraints.
          </p>
        </div>
        {error && (
          <Notice tone="alert" live>
            {error}
          </Notice>
        )}
        <ul className="grid gap-4 md:grid-cols-3">
          {PERSONAS.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void tryPersona(p.id)}
                aria-label={`Try Vantage as ${p.name}`}
                aria-describedby={`persona-${p.id}`}
                className="group flex h-full w-full flex-col gap-4 rounded-2xl border border-line bg-paper-raised p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-lift disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <span className="flex items-center gap-3">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-lg font-black text-marker transition-transform duration-300 group-hover:rotate-[-8deg]"
                    aria-hidden="true"
                  >
                    {p.name[0]}
                  </span>
                  <span className="text-xl font-extrabold">{p.name}</span>
                </span>
                <span id={`persona-${p.id}`} className="text-ink-soft">
                  {p.summary}
                </span>
                <span className="mt-auto flex flex-wrap gap-1.5 text-sm">
                  <span className="rounded-md bg-paper-sunk px-2 py-0.5 font-semibold">
                    {p.constraints.weeklyHours} h/week
                  </span>
                  <span className="rounded-md bg-paper-sunk px-2 py-0.5 font-semibold">
                    ${p.constraints.budgetUSD} budget
                  </span>
                  <span className="rounded-md bg-paper-sunk px-2 py-0.5 font-semibold">
                    {p.constraints.semestersRemaining} semesters
                  </span>
                </span>
                <span className="font-bold text-accent-strong underline decoration-transparent decoration-2 underline-offset-4 transition-colors group-hover:decoration-current">
                  {busy === p.id ? 'Starting…' : `Try as ${p.name}`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how-heading" className="space-y-6">
        <h2 id="how-heading" className="text-2xl font-extrabold sm:text-3xl">
          How it works
        </h2>
        <ol className="relative grid gap-8 md:grid-cols-4 md:gap-6">
          <span
            className="absolute bottom-3 left-[15px] top-3 w-[3px] rounded-full bg-line md:bottom-auto md:left-4 md:right-4 md:top-[15px] md:h-[3px] md:w-auto"
            aria-hidden="true"
          />
          {STEPS.map(([title, body], i) => (
            <li key={title} className="relative flex gap-4 md:flex-col md:gap-3">
              <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[3px] border-paper bg-ink text-sm font-black text-marker ring-[3px] ring-line">
                {i + 1}
              </span>
              <span>
                <span className="block font-bold">{title}</span>
                <span className="block text-sm text-ink-soft">{body}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
