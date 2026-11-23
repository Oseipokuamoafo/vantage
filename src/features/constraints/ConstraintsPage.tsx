import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, EmptyState, PageHeader, TextField, buttonClass } from '../../components/ui';
import { updateProfile } from '../../data/profiles';
import { useStudent } from '../../hooks/useStudent';
import { OnboardingStepper } from '../shell';
import { validateConstraints, type ConstraintsDraft } from './validation';

export default function ConstraintsPage() {
  const { user, profile } = useStudent();
  const navigate = useNavigate();
  const c = profile?.constraints;
  const [draft, setDraft] = useState<ConstraintsDraft>({
    weeklyHours: c ? String(c.weeklyHours) : '',
    budgetUSD: c ? String(c.budgetUSD) : '',
    semestersRemaining: c ? String(c.semestersRemaining) : '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ConstraintsDraft, string>>>({});
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
        Constraints are stored on your profile.
      </EmptyState>
    );
  }

  const set = (k: keyof ConstraintsDraft) => (e: { target: { value: string } }) => {
    setDraft({ ...draft, [k]: e.target.value });
    setSaved(false);
  };

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const { errors: next, value } = validateConstraints(draft);
    setErrors(next);
    if (!value || !user) return;
    updateProfile(user.id, { constraints: value });
    if (!profile?.onboardingComplete) navigate('/explore');
    else setSaved(true);
  }

  return (
    <div>
      <OnboardingStepper current="constraints" />
      <PageHeader
        eyebrow={profile.onboardingComplete ? undefined : 'Step 3 of 4'}
        title="What you have to work with"
        description="These appear as a separate “constraint fit” next to every rating. They never change the base rating, so you can see both."
      />
      <form onSubmit={onSubmit} noValidate>
        <Card className="grid gap-5 md:grid-cols-3">
          <TextField
            label="Hours available per week"
            required
            type="number"
            inputMode="numeric"
            min={1}
            max={60}
            hint="Time you could put toward career-building, after classes and work."
            value={draft.weeklyHours}
            error={errors.weeklyHours}
            onChange={set('weeklyHours')}
          />
          <TextField
            label="Budget (USD)"
            required
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            hint="Total you could spend on fees, exams and tools. $0 is a valid answer."
            value={draft.budgetUSD}
            error={errors.budgetUSD}
            onChange={set('budgetUSD')}
          />
          <TextField
            label="Semesters remaining"
            required
            type="number"
            inputMode="numeric"
            min={1}
            max={12}
            hint="Fall and spring terms left before you graduate. Summers are added in the planner."
            value={draft.semestersRemaining}
            error={errors.semestersRemaining}
            onChange={set('semestersRemaining')}
          />
        </Card>
        <div className="mt-4 flex items-center gap-3">
          <Button type="submit" variant="primary">
            {profile.onboardingComplete ? 'Save constraints' : 'Save and continue'}
          </Button>
          {saved && (
            <p role="status" className="text-sm text-accent-strong">
              Constraints saved. Fit notes are updated everywhere.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
