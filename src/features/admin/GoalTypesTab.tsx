import { useMemo, useState, type FormEvent } from 'react';
import { Button, Card, Notice, SelectField, TextAreaField, TextField } from '../../components/ui';
import { deleteGoalType, saveGoalType, useGoalTypes, useOpportunities } from '../../data/content';
import type { DataQuality, GoalStatus, GoalType } from '../../data/types';
import { scoreOpportunity } from '../scoring';
import { DATA_QUALITY, SummaryWithExplanation } from '../transparency';

interface Draft {
  id: string;
  name: string;
  description: string;
  examples: string;
  status: GoalStatus;
  time: string;
  skill: string;
  signaling: string;
  targetSkills: string;
  skillSaturation: string;
  timeHorizonHours: string;
  source: string;
  dataQuality: DataQuality;
}

const toDraft = (g: GoalType | null): Draft => ({
  id: g?.id ?? '',
  name: g?.name ?? '',
  description: g?.description ?? '',
  examples: g?.examples.join('\n') ?? '',
  status: g?.status ?? 'coming_soon',
  time: String(Math.round((g?.weights.time ?? 0.33) * 100)),
  skill: String(Math.round((g?.weights.skill ?? 0.33) * 100)),
  signaling: String(Math.round((g?.weights.signaling ?? 0.34) * 100)),
  targetSkills: g?.targetSkills.join(', ') ?? '',
  skillSaturation: String(g?.skillSaturation ?? 4),
  timeHorizonHours: String(g?.timeHorizonHours ?? 480),
  source: g?.source ?? 'Team estimate',
  dataQuality: g?.dataQuality ?? 'team_estimate',
});

function fromDraft(
  d: Draft,
  isNew: boolean,
  existingIds: string[],
): { errors: Record<string, string>; value?: GoalType } {
  const errors: Record<string, string> = {};
  if (isNew && !/^[a-z0-9][a-z0-9-]{1,60}$/.test(d.id))
    errors.id = 'Use lowercase letters, numbers and hyphens.';
  if (isNew && existingIds.includes(d.id)) errors.id = 'This id is already used.';
  if (d.name.trim().length < 3) errors.name = 'Enter a name.';
  const w = { time: Number(d.time), skill: Number(d.skill), signaling: Number(d.signaling) };
  for (const k of ['time', 'skill', 'signaling'] as const) {
    if (!Number.isFinite(w[k]) || w[k] < 0 || w[k] > 100) errors[k] = 'Enter 0–100.';
  }
  if (!errors.time && !errors.skill && !errors.signaling && w.time + w.skill + w.signaling === 0)
    errors.time = 'At least one weighting must be above 0.';
  const sat = Number(d.skillSaturation);
  if (!Number.isInteger(sat) || sat < 1 || sat > 20) errors.skillSaturation = 'Enter 1–20.';
  const horizon = Number(d.timeHorizonHours);
  if (!Number.isFinite(horizon) || horizon < 10) errors.timeHorizonHours = 'Enter 10 or more.';
  if (!d.source.trim()) errors.source = 'A source is required.';
  if (Object.keys(errors).length) return { errors };
  const sum = w.time + w.skill + w.signaling;
  return {
    errors,
    value: {
      id: d.id,
      name: d.name.trim(),
      description: d.description.trim(),
      examples: d.examples
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      status: d.status,
      weights: { time: w.time / sum, skill: w.skill / sum, signaling: w.signaling / sum },
      targetSkills: d.targetSkills
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
      skillSaturation: sat,
      timeHorizonHours: horizon,
      source: d.source.trim(),
      dataQuality: d.dataQuality,
    },
  };
}

export function GoalTypesTab({ actor }: { actor: string }) {
  const goals = useGoalTypes();
  const opps = useOpportunities();
  const [selectedId, setSelectedId] = useState(goals[0]?.id ?? 'new');
  const current = goals.find((g) => g.id === selectedId) ?? null;
  const [d, setD] = useState<Draft>(() => toDraft(current));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const set = (k: keyof Draft) => (e: { target: { value: string } }) =>
    setD({ ...d, [k]: e.target.value });

  function select(id: string) {
    setSelectedId(id);
    setD(toDraft(goals.find((g) => g.id === id) ?? null));
    setErrors({});
    setMessage('');
    setConfirmDelete(false);
  }

  const preview = useMemo(() => {
    const { value } = fromDraft({ ...d, id: d.id || 'preview' }, false, []);
    if (!value) return [];
    return opps
      .filter((o) => o.goalRelevance[current?.id ?? ''])
      .slice(0, 3)
      .map((o) => ({ o, r: scoreOpportunity(o, value) }));
  }, [d, opps, current?.id]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const { errors: next, value } = fromDraft(
      d,
      !current,
      goals.map((g) => g.id),
    );
    setErrors(next);
    if (!value) return;
    let summary: string | undefined;
    if (current) {
      const pct = (n: number) => `${Math.round(n * 100)}%`;
      const changed = (['time', 'skill', 'signaling'] as const).filter(
        (k) => Math.abs(current.weights[k] - value.weights[k]) > 0.001,
      );
      if (changed.length) {
        summary = `Changed "${value.name}" weightings: ${changed.map((k) => `${k} ${pct(current.weights[k])} → ${pct(value.weights[k])}`).join(', ')}`;
      }
    }
    saveGoalType(value, actor, summary);
    setSelectedId(value.id);
    setMessage(`Saved “${value.name}”. Ratings everywhere now use these settings.`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <Card as="section" aria-labelledby="goal-form-heading" className="space-y-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex-1">
            <SelectField
              label="Goal type to edit"
              value={selectedId}
              onChange={(e) => select(e.target.value)}
            >
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
              <option value="new">+ New goal type</option>
            </SelectField>
          </div>
        </div>
        <h3 id="goal-form-heading" className="font-display text-xl font-semibold">
          {current ? `Edit “${current.name}”` : 'New goal type'}
        </h3>
        {message && (
          <Notice tone="success" live>
            {message}
          </Notice>
        )}
        <form onSubmit={onSubmit} noValidate className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Id"
            required
            value={d.id}
            onChange={set('id')}
            error={errors.id}
            disabled={Boolean(current)}
          />
          <TextField
            label="Name"
            required
            value={d.name}
            onChange={set('name')}
            error={errors.name}
          />
          <div className="md:col-span-2">
            <TextAreaField
              label="Description"
              value={d.description}
              onChange={set('description')}
            />
          </div>
          <div className="md:col-span-2">
            <TextAreaField
              label="Example goals"
              value={d.examples}
              onChange={set('examples')}
              hint="One per line."
            />
          </div>
          <SelectField label="Status" required value={d.status} onChange={set('status')}>
            <option value="active">Active (selectable)</option>
            <option value="coming_soon">Coming soon (demo mode only)</option>
          </SelectField>
          <SelectField
            label="Data quality of weightings"
            required
            value={d.dataQuality}
            onChange={set('dataQuality')}
          >
            {Object.entries(DATA_QUALITY).map(([k, q]) => (
              <option key={k} value={k}>
                {q.label}
              </option>
            ))}
          </SelectField>
          <fieldset className="grid gap-3 sm:grid-cols-3 md:col-span-2">
            <legend className="mb-2 text-sm font-medium">
              Attribute weightings (%, normalized on save)
            </legend>
            <TextField
              label="Time"
              required
              type="number"
              min={0}
              max={100}
              value={d.time}
              onChange={set('time')}
              error={errors.time}
            />
            <TextField
              label="Skill"
              required
              type="number"
              min={0}
              max={100}
              value={d.skill}
              onChange={set('skill')}
              error={errors.skill}
            />
            <TextField
              label="Signaling"
              required
              type="number"
              min={0}
              max={100}
              value={d.signaling}
              onChange={set('signaling')}
              error={errors.signaling}
            />
          </fieldset>
          <div className="md:col-span-2">
            <TextField
              label="Target skills"
              value={d.targetSkills}
              onChange={set('targetSkills')}
              hint="Comma-separated. Drives the skill-development score."
            />
          </div>
          <TextField
            label="Skills for a full skill score"
            required
            type="number"
            value={d.skillSaturation}
            onChange={set('skillSaturation')}
            error={errors.skillSaturation}
          />
          <TextField
            label="Hours at which time score reaches 0"
            required
            type="number"
            value={d.timeHorizonHours}
            onChange={set('timeHorizonHours')}
            error={errors.timeHorizonHours}
          />
          <div className="md:col-span-2">
            <TextField
              label="Source"
              required
              value={d.source}
              onChange={set('source')}
              error={errors.source}
            />
          </div>
          <div className="flex flex-wrap gap-2 md:col-span-2">
            <Button type="submit" variant="primary">
              Save goal type
            </Button>
            {current &&
              (confirmDelete ? (
                <>
                  <Button
                    variant="danger"
                    onClick={() => {
                      deleteGoalType(current.id, actor);
                      select(goals.find((g) => g.id !== current.id)?.id ?? 'new');
                    }}
                  >
                    Confirm delete
                  </Button>
                  <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
                </>
              ) : (
                <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                  Delete goal type
                </Button>
              ))}
          </div>
          {confirmDelete && (
            <p className="text-sm text-alert md:col-span-2">
              Students with this goal will be asked to pick another one. Saved plans keep the goal
              id.
            </p>
          )}
        </form>
      </Card>
      <aside aria-label="Weighting preview" className="space-y-3">
        <h3 className="font-display text-lg font-semibold">Live preview</h3>
        <p className="text-sm text-ink-soft">
          How the unsaved weightings would rate a few catalog entries.
        </p>
        {preview.length === 0 && (
          <p className="text-sm text-ink-muted">No opportunities rated for this goal yet.</p>
        )}
        {preview.map(({ o, r }) => (
          <Card key={o.id} className="space-y-2">
            <p className="text-sm font-semibold">{o.title}</p>
            <SummaryWithExplanation result={r} goalName={d.name || 'this goal'} />
          </Card>
        ))}
      </aside>
    </div>
  );
}
