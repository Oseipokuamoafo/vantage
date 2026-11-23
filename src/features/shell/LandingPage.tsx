import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Notice, Tag } from '../../components/ui';
import { useGoalTypes, useOpportunities } from '../../data/content';
import { ScoreWithExplanation, SummaryWithExplanation, DataQualityLegend } from '../transparency';
import { scoreOpportunity } from '../scoring';
import { PERSONAS, startPersona } from './personas';
import { EmailCapture } from './landing/EmailCapture';
import { StudentIllustration } from './landing/StudentIllustration';

const PATHS: { label: string; icon: 'badge' | 'code' | 'people' | 'briefcase' | 'flask' }[] = [
  { label: 'AWS certifications', icon: 'badge' },
  { label: 'Azure certifications', icon: 'badge' },
  { label: 'Terraform', icon: 'badge' },
  { label: 'Cloud side projects', icon: 'code' },
  { label: 'Hackathons', icon: 'code' },
  { label: 'Student orgs', icon: 'people' },
  { label: 'Cloud clubs', icon: 'people' },
  { label: 'Internships', icon: 'briefcase' },
  { label: 'Campus IT jobs', icon: 'briefcase' },
  { label: 'REUs', icon: 'flask' },
  { label: 'Faculty research', icon: 'flask' },
];

function PathIcon({ icon }: { icon: (typeof PATHS)[number]['icon'] }) {
  const paths: Record<typeof icon, string> = {
    badge:
      'M12 3 14.4 5.2l3.2-.3.6 3.1 2.8 1.6-1.3 2.9 1.3 2.9-2.8 1.6-.6 3.1-3.2-.3L12 21l-2.4-2.2-3.2.3-.6-3.1-2.8-1.6L4.3 11.5 3 8.6l2.8-1.6.6-3.1 3.2.3Z',
    code: 'M8.5 7 3.5 12l5 5M15.5 7l5 5-5 5M13.5 5l-3 14',
    people:
      'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2.5 20c.5-3.6 3.2-6 6.5-6s6 2.4 6.5 6M16 4.3a3.5 3.5 0 0 1 0 6.4M18.5 14.4c1.7.8 2.8 2.9 3 5.6',
    briefcase:
      'M3.5 8.5h17v11h-17ZM8.5 8.5V6a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 6v2.5M3.5 13h17',
    flask:
      'M9.5 3.5h5M10.5 3.5v6L4.8 18.6A1.6 1.6 0 0 0 6.2 21h11.6a1.6 1.6 0 0 0 1.4-2.4L13.5 9.5v-6M7.5 15h9',
  };
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="shrink-0 text-primary"
    >
      <path
        d={paths[icon]}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const STEPS = [
  ['Profile', 'Year, major and institution. Optional background fields stay in your browser.'],
  ['Goal', 'Choose a target outcome, such as a cloud engineering internship.'],
  ['Constraints', 'Weekly hours, budget and the semesters you have left.'],
  ['Compare', 'Put 2–4 options side by side, then lay them out by semester.'],
];

const COVERAGE = [
  'Certifications',
  'Side projects',
  'Student orgs',
  'Internships',
  'Research and REUs',
  'Weekly hours',
  'Budget',
  'Semesters left',
  'Recruiting windows',
  'Outcome data',
];

export default function LandingPage() {
  const navigate = useNavigate();
  const goalTypes = useGoalTypes();
  const opportunities = useOpportunities();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleGoal = goalTypes.find((g) => g.status === 'active') ?? goalTypes[0];
  const sampleOpp = opportunities.find((o) => o.id === 'aws-saa') ?? opportunities[0];
  const sample =
    sampleGoal && sampleOpp
      ? scoreOpportunity(sampleOpp, sampleGoal, {
          weeklyHours: 8,
          budgetUSD: 100,
          semestersRemaining: 5,
        })
      : null;

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
    <div className="space-y-24 sm:space-y-32">
      {/* Hero */}
      <section
        aria-labelledby="hero-heading"
        className="mx-auto max-w-3xl pt-4 text-center sm:pt-10"
      >
        <p className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-tint px-4 py-1.5 text-sm font-semibold text-primary-active">
          <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
          Now with historical outcomes
        </p>
        <h1
          id="hero-heading"
          className="mt-6 text-[2.15rem] font-extrabold leading-[1.1] tracking-[-0.035em] sm:text-5xl lg:text-[4rem]"
        >
          Compare your next move, with the trade‑offs in plain sight
        </h1>
        <p className="mx-auto mt-6 max-w-[56ch] text-lg leading-relaxed text-body">
          Line up certifications, side projects, student orgs, internships and research programs
          against your goal, your weekly hours and your budget. Every rating shows its reasons. The
          decision stays yours.
        </p>
        <div className="mt-9">
          <EmailCapture />
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="w-full text-sm text-muted sm:w-auto">
            Or explore as a sample student:
          </span>
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={busy !== null}
              onClick={() => void tryPersona(p.id)}
              title={p.summary}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-full border-[1.5px] border-primary bg-surface py-1 pl-1 pr-4 text-sm font-semibold text-navy transition duration-brand ease-brand hover:-translate-y-px hover:bg-tint disabled:opacity-60"
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
                aria-hidden="true"
              >
                {p.name[0]}
              </span>
              {busy === p.id ? 'Starting…' : `Try as ${p.name}`}
            </button>
          ))}
        </div>
        {error && (
          <div className="mx-auto mt-4 max-w-md text-left">
            <Notice tone="alert" live>
              {error}
            </Notice>
          </div>
        )}
      </section>

      {/* Path strip */}
      <section aria-labelledby="paths-heading" className="space-y-6">
        <h2 id="paths-heading" className="text-center text-base font-semibold text-body">
          Compare paths across…
        </h2>
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)] motion-reduce:[mask-image:none]">
          <div className="flex w-max animate-marquee gap-3 hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center">
            {[0, 1].map((copy) => (
              <ul
                key={copy}
                className={`flex gap-3 motion-reduce:flex-wrap motion-reduce:justify-center ${copy ? 'motion-reduce:hidden' : ''}`}
                aria-hidden={copy ? true : undefined}
              >
                {PATHS.map((p) => (
                  <li
                    key={p.label}
                    className="flex min-h-[56px] items-center gap-2.5 whitespace-nowrap rounded-2xl border border-border bg-surface px-5 text-[15px] font-semibold text-navy shadow-soft"
                  >
                    <PathIcon icon={p.icon} />
                    {p.label}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </section>

      {/* Two-card feature row */}
      <section aria-label="Why students use Vantage" className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <Card tone="tint" className="flex flex-col p-7 sm:p-9">
          <svg
            width="44"
            height="36"
            viewBox="0 0 44 36"
            aria-hidden="true"
            className="text-primary"
          >
            <path
              d="M0 36V22C0 9 7 2 18 0l2 5c-6 2-9 6-9.5 12H18v19Zm26 0V22C26 9 33 2 44 0l2 5c-6 2-9 6-9.5 12H44v19Z"
              fill="currentColor"
            />
          </svg>
          <p className="mt-3 inline-flex w-fit rounded-full border border-primary/30 bg-surface px-3 py-0.5 text-xs font-semibold text-primary-active">
            Sample story (fictional)
          </p>
          <blockquote className="mt-4 flex-1">
            <p className="text-2xl font-extrabold leading-snug tracking-[-0.02em] text-navy">
              “The certification and the side project asked for about the same hours. Seeing which
              skills each one built is what made the difference for me.”
            </p>
          </blockquote>
          <p className="mt-6 text-sm text-body">
            <span className="font-bold text-navy">Jordan A.</span>, sophomore, information systems.
            A fictional student written for this prototype.
          </p>
        </Card>
        <Card className="relative overflow-visible p-7 sm:p-9 lg:pr-56">
          <h2 className="max-w-md text-3xl font-extrabold tracking-[-0.025em] sm:text-[2.5rem]">
            Built for students choosing between good options
          </h2>
          <p className="mt-4 max-w-lg text-body">
            Most students have more possible paths than hours. Vantage puts them on the same three
            measures so the trade-offs are easy to see.
          </p>
          <ul className="mt-6 flex max-w-lg flex-wrap gap-2" aria-label="What Vantage covers">
            {COVERAGE.map((c) => (
              <li key={c}>
                <Tag>{c}</Tag>
              </li>
            ))}
          </ul>
          <StudentIllustration className="pointer-events-none mx-auto mt-8 w-64 lg:absolute lg:-bottom-6 lg:-right-3 lg:mt-0 lg:w-72 xl:-right-8" />
        </Card>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-heading" className="space-y-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="how-heading"
            className="text-3xl font-extrabold tracking-[-0.025em] sm:text-[2.6rem]"
          >
            How it works
          </h2>
          <p className="mt-3 text-body">
            Four short steps, about five minutes. You can change any answer later.
          </p>
        </div>
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([title, body], i) => (
            <li key={title}>
              <Card interactive className="h-full">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-base font-bold text-white"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <h3 className="mt-5 text-lg font-bold">
                  <span className="sr-only">Step {i + 1}: </span>
                  {title}
                </h3>
                <p className="mt-2 text-[15px] text-body">{body}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      {/* Transparency */}
      <section aria-labelledby="why-heading" className="grid items-center gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <h2
            id="why-heading"
            className="text-3xl font-extrabold tracking-[-0.025em] sm:text-[2.6rem]"
          >
            See why every rating is what it is
          </h2>
          <p className="text-lg text-body">
            Each 0–10 rating names the attribute that drove it, shows the weighting behind it and
            carries a data-quality label. Your hours and budget show up as a separate fit check
            instead of being folded in.
          </p>
          <DataQualityLegend />
        </div>
        {sample && sampleOpp && sampleGoal && (
          <Card className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-muted">Sample rating, sample data</p>
              <span className="rounded-full bg-tint px-3 py-1 text-xs font-semibold text-primary-active">
                {sampleGoal.name}
              </span>
            </div>
            <h3 className="text-xl font-extrabold">{sampleOpp.title}</h3>
            <ScoreWithExplanation
              attribute={sample.attributes.skill}
              quality={sample.dataQuality}
            />
            <SummaryWithExplanation result={sample} goalName={sampleGoal.name} />
          </Card>
        )}
      </section>

      {/* Final CTA */}
      <section aria-labelledby="cta-heading">
        <Card tone="tint" className="px-6 py-12 text-center sm:px-12 sm:py-16">
          <h2
            id="cta-heading"
            className="mx-auto max-w-2xl text-3xl font-extrabold tracking-[-0.025em] sm:text-[2.6rem]"
          >
            Start with your goal and keep every trade‑off in view
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-body">
            Free, no download, and your data stays in this browser.
          </p>
          <div className="mt-8">
            <EmailCapture />
          </div>
        </Card>
      </section>
    </div>
  );
}
