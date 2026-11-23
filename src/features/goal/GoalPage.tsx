import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge, Button, EmptyState, Notice, PageHeader, buttonClass } from '../../components/ui';
import { isGoalSelectable, useSettings } from '../../data/content';
import { updateProfile } from '../../data/profiles';
import { useStudent } from '../../hooks/useStudent';
import { OnboardingStepper } from '../shell';
import { DataQualityBadge } from '../transparency';

export default function GoalPage() {
  const { user, profile, goalTypes } = useStudent();
  const settings = useSettings();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(profile?.goalTypeId ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (!user) return null;
  if (!profile) {
    return (
      <EmptyState
        title="Start with your profile"
        action={
          <Link to="/profile" className={buttonClass('primary')}>
            Go to profile
          </Link>
        }
      >
        A goal is stored on your profile, so create the profile first.
      </EmptyState>
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const goal = goalTypes.find((g) => g.id === selected);
    if (!goal || !isGoalSelectable(goal, settings) || !user) {
      setError('Choose one of the available goals.');
      return;
    }
    setError(null);
    updateProfile(user.id, { goalTypeId: goal.id });
    if (!profile?.onboardingComplete) navigate('/constraints');
    else setSaved(true);
  }

  return (
    <div>
      <OnboardingStepper current="goal" />
      <PageHeader
        eyebrow="Step 2 · Goal"
        title="What are you working toward?"
        description="Your goal sets how much each of the three measures counts. Weightings for each goal are shown so you can see exactly how it changes things."
      />
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <fieldset className="space-y-3">
          <legend className="sr-only">Target outcome</legend>
          {goalTypes.map((g) => {
            const selectable = isGoalSelectable(g, settings);
            const id = `goal-${g.id}`;
            return (
              <div
                key={g.id}
                className={`rounded-xl border bg-paper-raised p-4 ${
                  selected === g.id ? 'border-accent ring-2 ring-accent/30' : 'border-line'
                } ${selectable ? '' : 'opacity-70'}`}
              >
                <div className="flex items-start gap-3">
                  <input
                    id={id}
                    type="radio"
                    name="goal"
                    value={g.id}
                    checked={selected === g.id}
                    disabled={!selectable}
                    onChange={() => {
                      setSelected(g.id);
                      setSaved(false);
                    }}
                    className="mt-1.5 h-5 w-5 accent-accent"
                    aria-describedby={`${id}-desc`}
                  />
                  <div className="flex-1 space-y-2">
                    <label
                      htmlFor={id}
                      className="flex flex-wrap items-center gap-2 font-display text-lg font-semibold"
                    >
                      {g.name}
                      {g.status === 'coming_soon' && <Badge tone="caution">Coming soon</Badge>}
                    </label>
                    <div id={`${id}-desc`} className="space-y-2 text-sm text-ink-soft">
                      <p>{g.description}</p>
                      <div>
                        <p className="font-medium text-ink">Example goals</p>
                        <ul className="list-disc pl-5">
                          {g.examples.map((ex) => (
                            <li key={ex}>{ex}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="flex flex-wrap items-center gap-2">
                        <span>
                          Weightings: time {Math.round(g.weights.time * 100)}%, skill{' '}
                          {Math.round(g.weights.skill * 100)}%, signaling{' '}
                          {Math.round(g.weights.signaling * 100)}%
                        </span>
                        <DataQualityBadge quality={g.dataQuality} />
                      </p>
                      {!selectable && (
                        <p className="text-ink-muted">
                          This track is still being built and has placeholder content. It becomes
                          selectable when an admin enables it or turns on demo mode.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </fieldset>
        {error && (
          <Notice tone="alert" live>
            {error}
          </Notice>
        )}
        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary">
            {profile.onboardingComplete ? 'Save goal' : 'Save and continue'}
          </Button>
          {saved && (
            <p role="status" className="text-sm text-accent-strong">
              Goal saved. Ratings now use this goal.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
