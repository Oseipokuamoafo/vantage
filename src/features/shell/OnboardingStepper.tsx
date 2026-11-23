import { Link } from 'react-router-dom';
import { CheckIcon } from '../../components/ui';
import { useStudent } from '../../hooks/useStudent';

export type StepKey = 'profile' | 'goal' | 'constraints' | 'explore';

const STEPS: { key: StepKey; label: string; to: string }[] = [
  { key: 'profile', label: 'Profile', to: '/profile' },
  { key: 'goal', label: 'Goal', to: '/goal' },
  { key: 'constraints', label: 'Constraints', to: '/constraints' },
  { key: 'explore', label: 'Explore', to: '/explore' },
];

/** Rounded first-run stepper. Hidden once onboarding is complete. */
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
    <nav aria-label="Setup progress" className="mb-10">
      <ol className="grid grid-cols-4 gap-1 rounded-full border border-border bg-surface p-1.5 shadow-soft">
        {STEPS.map((step, i) => {
          const isCurrent = step.key === current;
          const reachable = i === 0 || done[STEPS[i - 1]!.key];
          const body = (
            <>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isCurrent
                    ? 'bg-white text-primary'
                    : done[step.key]
                      ? 'bg-primary text-white'
                      : 'bg-tint text-primary-active'
                }`}
                aria-hidden="true"
              >
                {done[step.key] && !isCurrent ? <CheckIcon /> : i + 1}
              </span>
              <span className="hidden text-sm font-semibold sm:inline">{step.label}</span>
              <span className="sr-only">
                {step.label}
                {done[step.key] ? ' (done)' : ''}
                {isCurrent ? ' (current step)' : ''}
              </span>
            </>
          );
          const cls = `flex min-h-[44px] items-center justify-center gap-2 rounded-full px-2 transition-colors duration-brand ${
            isCurrent ? 'bg-primary text-white' : 'text-navy'
          }`;
          return (
            <li key={step.key} aria-current={isCurrent ? 'step' : undefined}>
              {reachable && !isCurrent ? (
                <Link to={step.to} className={`${cls} hover:bg-tint`}>
                  {body}
                </Link>
              ) : (
                <div className={`${cls} ${!reachable && !isCurrent ? 'text-muted' : ''}`}>
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
