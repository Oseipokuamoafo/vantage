import { useState, type FormEvent } from 'react';
import {
  Badge,
  Button,
  Card,
  Notice,
  SelectField,
  TextAreaField,
  TextField,
} from '../../components/ui';
import {
  deleteOpportunity,
  saveOpportunity,
  useGoalTypes,
  useOpportunities,
} from '../../data/content';
import { OPPORTUNITY_TYPES, type Opportunity } from '../../data/types';
import { formatCost, TYPE_LABELS } from '../catalog';
import { DATA_QUALITY, DataQualityBadge } from '../transparency';
import { toDraft, validateOpportunityDraft, type OpportunityDraft } from './opportunityForm';

function OpportunityForm({
  initial,
  actor,
  onDone,
}: {
  initial: Opportunity | null;
  actor: string;
  onDone: (msg: string) => void;
}) {
  const goals = useGoalTypes();
  const opps = useOpportunities();
  const [d, setD] = useState<OpportunityDraft>(() =>
    toDraft(
      initial,
      goals.map((g) => g.id),
    ),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof OpportunityDraft) => (e: { target: { value: string } }) =>
    setD({ ...d, [k]: e.target.value });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const { errors: next, value } = validateOpportunityDraft(d, {
      isNew: !initial,
      existingIds: opps.map((o) => o.id),
    });
    setErrors(next);
    if (!value) return;
    saveOpportunity(value, actor);
    onDone(`${initial ? 'Updated' : 'Added'} “${value.title}”.`);
  }

  return (
    <Card as="section" aria-labelledby="opp-form-heading" className="space-y-4">
      <h3 id="opp-form-heading" className="font-display text-xl font-semibold">
        {initial ? `Edit “${initial.title}”` : 'Add an opportunity'}
      </h3>
      <form onSubmit={onSubmit} noValidate className="grid gap-4 md:grid-cols-2">
        <TextField
          label="Id"
          required
          value={d.id}
          onChange={set('id')}
          error={errors.id}
          disabled={Boolean(initial)}
          hint="Lowercase, hyphens, e.g. aws-saa"
        />
        <SelectField
          label="Type"
          required
          value={d.type}
          onChange={set('type')}
          error={errors.type}
        >
          {OPPORTUNITY_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </SelectField>
        <div className="md:col-span-2">
          <TextField
            label="Title"
            required
            value={d.title}
            onChange={set('title')}
            error={errors.title}
          />
        </div>
        <div className="md:col-span-2">
          <TextAreaField
            label="Description"
            required
            value={d.description}
            onChange={set('description')}
            error={errors.description}
          />
        </div>
        <TextField
          label="Hours per week"
          required
          type="number"
          step="any"
          value={d.hours}
          onChange={set('hours')}
          error={errors.hours}
        />
        <TextField
          label="Duration (weeks)"
          required
          type="number"
          value={d.weeks}
          onChange={set('weeks')}
          error={errors.weeks}
        />
        <TextField
          label="Cost (USD)"
          required
          type="number"
          step="any"
          value={d.cost}
          onChange={set('cost')}
          error={errors.cost}
        />
        <TextField
          label="Skills built"
          required
          value={d.skills}
          onChange={set('skills')}
          error={errors.skills}
          hint="Comma-separated; matched against each goal's target skills."
        />
        <div className="md:col-span-2">
          <TextAreaField
            label="Signaling notes"
            value={d.signalingNotes}
            onChange={set('signalingNotes')}
          />
        </div>
        <div className="md:col-span-2">
          <TextAreaField
            label="Timing windows"
            value={d.timingWindows}
            onChange={set('timingWindows')}
            error={errors.timingWindows}
            hint="One per line: label | spring, summer or fall | note"
          />
        </div>
        <fieldset className="space-y-3 md:col-span-2">
          <legend className="text-sm font-medium">Signaling value per goal type (0–10)</legend>
          {errors.relevance && <p className="text-sm font-medium text-alert">{errors.relevance}</p>}
          {goals.map((g) => (
            <div
              key={g.id}
              className="grid gap-2 rounded-lg border border-line p-3 sm:grid-cols-[8rem_1fr]"
            >
              <TextField
                label={`${g.name}: signaling`}
                type="number"
                min={0}
                max={10}
                step="any"
                value={d.relevance[g.id]?.signaling ?? ''}
                error={errors[`relevance.${g.id}`]}
                onChange={(e) =>
                  setD({
                    ...d,
                    relevance: {
                      ...d.relevance,
                      [g.id]: {
                        signaling: e.target.value,
                        rationale: d.relevance[g.id]?.rationale ?? '',
                      },
                    },
                  })
                }
              />
              <TextField
                label="Rationale"
                value={d.relevance[g.id]?.rationale ?? ''}
                onChange={(e) =>
                  setD({
                    ...d,
                    relevance: {
                      ...d.relevance,
                      [g.id]: {
                        signaling: d.relevance[g.id]?.signaling ?? '',
                        rationale: e.target.value,
                      },
                    },
                  })
                }
              />
            </div>
          ))}
        </fieldset>
        <TextField
          label="Source"
          required
          value={d.source}
          onChange={set('source')}
          error={errors.source}
        />
        <SelectField
          label="Data quality"
          required
          value={d.dataQuality}
          onChange={set('dataQuality')}
          error={errors.dataQuality}
        >
          {Object.entries(DATA_QUALITY).map(([k, q]) => (
            <option key={k} value={k}>
              {q.label}
            </option>
          ))}
        </SelectField>
        <div className="flex flex-wrap gap-2 md:col-span-2">
          <Button type="submit" variant="primary">
            {initial ? 'Save changes' : 'Add opportunity'}
          </Button>
          <Button onClick={() => onDone('')}>Cancel</Button>
          {Object.keys(errors).length > 0 && (
            <p role="alert" className="self-center text-sm font-medium text-alert">
              Fix the highlighted fields.
            </p>
          )}
        </div>
      </form>
    </Card>
  );
}

export function OpportunitiesTab({ actor }: { actor: string }) {
  const opps = useOpportunities();
  const [editing, setEditing] = useState<Opportunity | 'new' | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  if (editing) {
    return (
      <OpportunityForm
        key={editing === 'new' ? 'new' : editing.id}
        initial={editing === 'new' ? null : editing}
        actor={actor}
        onDone={(msg) => {
          setEditing(null);
          setMessage(msg);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-soft">
          {opps.length} opportunities. Changes appear in the catalog immediately.
        </p>
        <Button variant="primary" onClick={() => setEditing('new')}>
          Add opportunity
        </Button>
      </div>
      {message && (
        <Notice tone="success" live>
          {message}
        </Notice>
      )}
      <ul className="divide-y divide-line rounded-xl border border-line bg-paper-raised">
        {opps.map((o) => (
          <li
            key={o.id}
            className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-medium">{o.title}</p>
              <p className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                <Badge>{TYPE_LABELS[o.type]}</Badge>
                <span>
                  {o.timeCommitmentHoursPerWeek} hrs/wk · {o.durationWeeks} wk ·{' '}
                  {formatCost(o.costUSD)}
                </span>
                <DataQualityBadge quality={o.dataQuality} />
                <code>{o.id}</code>
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button size="sm" onClick={() => setEditing(o)}>
                Edit<span className="sr-only"> {o.title}</span>
              </Button>
              {confirmId === o.id ? (
                <>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      deleteOpportunity(o.id, actor);
                      setConfirmId(null);
                      setMessage(`Deleted “${o.title}”.`);
                    }}
                  >
                    Confirm delete
                  </Button>
                  <Button size="sm" onClick={() => setConfirmId(null)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="danger" onClick={() => setConfirmId(o.id)}>
                  Delete<span className="sr-only"> {o.title}</span>
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
