import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Notice, PageHeader, SelectField, TextField } from '../../components/ui';
import { saveProfile } from '../../data/profiles';
import { YEARS, type Profile, type Year, type YesNoPrivate } from '../../data/types';
import { useStudent } from '../../hooks/useStudent';
import { OnboardingStepper } from '../shell';
import {
  hasErrors,
  validateProfile,
  YEAR_LABELS,
  YES_NO_LABELS,
  type FieldErrors,
  type ProfileDraft,
} from './validation';

function toDraft(p: Profile | null): ProfileDraft {
  return {
    year: p?.year ?? '',
    major: p?.major ?? '',
    institution: p?.institution ?? '',
    firstGen: p?.firstGen ?? '',
    transferStudent: p?.transferStudent ?? '',
    workingWhileStudying: p?.workingWhileStudying ?? '',
  };
}

const optional = (v: string) => (v ? (v as YesNoPrivate) : undefined);

export default function ProfilePage() {
  const { user, profile } = useStudent();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<ProfileDraft>(() => toDraft(profile));
  const [errors, setErrors] = useState<FieldErrors<keyof ProfileDraft>>({});
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const set = (k: keyof ProfileDraft) => (e: { target: { value: string } }) => {
    setDraft({ ...draft, [k]: e.target.value });
    setSaved(false);
  };

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = validateProfile(draft);
    setErrors(next);
    if (hasErrors(next) || !user) return;
    saveProfile({
      ...(profile ?? { onboardingComplete: false }),
      userId: user.id,
      year: draft.year as Year,
      major: draft.major.trim(),
      institution: draft.institution.trim(),
      firstGen: optional(draft.firstGen),
      transferStudent: optional(draft.transferStudent),
      workingWhileStudying: optional(draft.workingWhileStudying),
      updatedAt: new Date().toISOString(),
    });
    if (!profile?.onboardingComplete) navigate('/goal');
    else setSaved(true);
  }

  const yesNo = (
    <>
      <option value="">Not answered</option>
      {Object.entries(YES_NO_LABELS).map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </>
  );

  return (
    <div>
      <OnboardingStepper current="profile" />
      <PageHeader
        eyebrow={profile?.onboardingComplete ? undefined : 'Step 1 of 4'}
        title="About you"
        description="Three required fields and a few optional ones. You can change these at any time; saved plans are not affected."
      />
      <form onSubmit={onSubmit} noValidate className="grid gap-6 lg:grid-cols-2">
        <Card as="section" aria-labelledby="req-heading" className="space-y-4">
          <h2 id="req-heading" className="text-xl font-extrabold">
            Studies
          </h2>
          <SelectField
            label="Year"
            required
            value={draft.year}
            error={errors.year}
            onChange={set('year')}
          >
            <option value="">Choose…</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {YEAR_LABELS[y]}
              </option>
            ))}
          </SelectField>
          <TextField
            label="Major"
            required
            value={draft.major}
            error={errors.major}
            onChange={set('major')}
            autoComplete="off"
          />
          <TextField
            label="Institution"
            required
            value={draft.institution}
            error={errors.institution}
            onChange={set('institution')}
            autoComplete="organization"
          />
        </Card>
        <Card as="section" aria-labelledby="bg-heading" className="space-y-4">
          <h2 id="bg-heading" className="text-xl font-extrabold">
            Background
          </h2>
          <Notice title="How this is used">
            These answers are optional. They are used only to add context to what you see (for
            example, noting cost and time trade-offs) and are never used to filter options out. They
            stay in this browser and are not sent anywhere.
          </Notice>
          <SelectField
            label="First-generation college student"
            value={draft.firstGen}
            error={errors.firstGen}
            onChange={set('firstGen')}
          >
            {yesNo}
          </SelectField>
          <SelectField
            label="Transfer student"
            value={draft.transferStudent}
            error={errors.transferStudent}
            onChange={set('transferStudent')}
          >
            {yesNo}
          </SelectField>
          <SelectField
            label="Working while studying"
            value={draft.workingWhileStudying}
            error={errors.workingWhileStudying}
            onChange={set('workingWhileStudying')}
          >
            {yesNo}
          </SelectField>
        </Card>
        <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
          <Button type="submit" variant="primary">
            {profile?.onboardingComplete ? 'Save profile' : 'Save and continue'}
          </Button>
          {hasErrors(errors) && (
            <p role="alert" className="text-sm font-medium text-alert">
              Some fields need attention.
            </p>
          )}
          {saved && (
            <p role="status" className="text-sm text-accent-strong">
              Profile saved.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
