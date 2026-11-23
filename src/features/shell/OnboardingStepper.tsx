import { Link } from 'react-router-dom';
import { useStudent } from '../../hooks/useStudent';

export type StepKey = 'profile' | 'goal' | 'constraints' | 'explore';

const STEPS: { key: StepKey; label: string; to: string }[] = [
  { key: 'profile', label: 'Profile', to: '/profile' },
  { key: 'goal', label: 'Goal', to: '/goal' },
  { key: 'constraints', label: 'Constraints', to: '/constraints' },
  { key: 'explore', label: 'Explore', to: '/explore' },
];

/** Guided first-run stepper. Hidden once onboarding is complete. */
export function OnboardingStepper({ current }: { current: StepKey }) {
  const { profile } = useStudent();
  if (profile?.onboardingComplete) return null;

  const done: Record<StepKey, boolean> = {
    profile: Boolean(profile),
    goal: Boolean(profile?.goalTypeId),
    constraints: Boolean(profile?.constraints),
    explore: false,
  };

  return (
    <nav aria-label="Setup progress" className="mb-6">
      <ol className="grid grid-cols-4 gap-1 sm:gap-2">
        {STEPS.map((step, i) => {
          const isCurrent = step.key === current;
          const reachable = i === 0 || done[STEPS[i - 1]!.key];
          const body = (
            <>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  isCurrent
                    ? 'bg-accent text-white'
                    : done[step.key]
                      ? 'bg-accent-soft text-accent-strong'
                      : 'bg-paper-sunk text-ink-muted'
                }`}
                aria-hidden="true"
              >
                {done[step.key] && !isCurrent ? '✓' : i + 1}
              </span>
              <span className="text-xs font-medium sm:text-sm">
                {step.label}
                <span className="sr-only">
                  {done[step.key] ? ' (done)' : ''}
                  {isCurrent ? ' (current step)' : ''}
                </span>
              </span>
            </>
          );
          return (
            <li key={step.key} aria-current={isCurrent ? 'step' : undefined}>
              {reachable && !isCurrent ? (
                <Link
                  to={step.to}
                  className="flex flex-col items-center gap-1 rounded-lg p-1 text-center sm:flex-row"
                >
                  {body}
                </Link>
              ) : (
                <div
                  className={`flex flex-col items-center gap-1 p-1 text-center sm:flex-row ${
                    isCurrent ? 'text-ink' : 'text-ink-muted'
                  }`}
                >
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
