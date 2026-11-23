import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Notice, buttonClass } from '../../components/ui';
import { useStudent } from '../../hooks/useStudent';
import { PERSONAS, startPersona } from './personas';

const ATTRIBUTES = [
  {
    name: 'Time commitment',
    body: 'Total hours an option asks of you, compared with what you have each week.',
  },
  {
    name: 'Skill development',
    body: 'Which skills it builds that are relevant to the goal you picked.',
  },
  {
    name: 'Signaling value',
    body: 'How recruiters and programs tend to read it on an application.',
  },
];

export function LandingPage() {
  const { user, profile } = useStudent();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    <div className="space-y-12">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div className="space-y-5">
          <p className="eyebrow">Decision support for students</p>
          <h1 className="font-display text-4xl font-semibold leading-[1.1] sm:text-5xl">
            See the trade-offs before you spend a semester on them.
          </h1>
          <p className="max-w-xl text-lg text-ink-soft">
            Vantage lays out certifications, side projects, student orgs, internships and research
            programs next to each other, measured against your goal, your hours and your budget. You
            make the call.
          </p>
          <div className="flex flex-wrap gap-3">
            {user ? (
              <Link
                to={profile?.onboardingComplete ? '/explore' : '/profile'}
                className={buttonClass('primary')}
              >
                {profile?.onboardingComplete ? 'Go to Explore' : 'Continue setup'}
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
        <Card as="section" aria-labelledby="attr-heading" className="space-y-4">
          <h2 id="attr-heading" className="font-display text-xl font-semibold">
            Every option, on the same three measures
          </h2>
          <dl className="space-y-3">
            {ATTRIBUTES.map((a) => (
              <div key={a.name}>
                <dt className="font-semibold">{a.name}</dt>
                <dd className="text-sm text-ink-soft">{a.body}</dd>
              </div>
            ))}
          </dl>
          <p className="text-sm text-ink-muted">
            Each rating shows what drove it and how reliable the underlying data is.
          </p>
        </Card>
      </section>

      <section aria-labelledby="personas-heading" className="space-y-4">
        <div>
          <h2 id="personas-heading" className="font-display text-2xl font-semibold">
            Try a demo persona
          </h2>
          <p className="text-ink-soft">
            One click signs you in as a sample student with a prefilled profile, goal and
            constraints.
          </p>
        </div>
        {error && (
          <Notice tone="alert" live>
            {error}
          </Notice>
        )}
        <ul className="grid gap-4 md:grid-cols-3">
          {PERSONAS.map((p) => (
            <Card as="li" key={p.id} className="flex flex-col gap-3">
              <div>
                <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                <p className="text-sm text-ink-soft">{p.summary}</p>
              </div>
              <p className="text-sm text-ink-muted">
                {p.constraints.weeklyHours} hrs/week · ${p.constraints.budgetUSD} budget ·{' '}
                {p.constraints.semestersRemaining} semesters left
              </p>
              <Button
                variant="primary"
                className="mt-auto"
                disabled={busy !== null}
                onClick={() => void tryPersona(p.id)}
                aria-label={`Try Vantage as ${p.name}`}
              >
                {busy === p.id ? 'Starting…' : `Try as ${p.name}`}
              </Button>
            </Card>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how-heading" className="space-y-4">
        <h2 id="how-heading" className="font-display text-2xl font-semibold">
          How it works
        </h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              'Profile',
              'Year, major and institution. Optional background fields stay in your browser.',
            ],
            ['Goal', 'Pick a target outcome, such as a cloud engineering internship.'],
            ['Constraints', 'Weekly hours, budget and semesters remaining.'],
            [
              'Explore & compare',
              'Filter the catalog, compare 2–4 options and sequence them by semester.',
            ],
          ].map(([title, body], i) => (
            <li key={title} className="rounded-xl border border-line p-4">
              <p className="eyebrow">Step {i + 1}</p>
              <p className="mt-1 font-semibold">{title}</p>
              <p className="text-sm text-ink-soft">{body}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
