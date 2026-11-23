import { useState, type FormEvent } from 'react';
import { Button, Card, Notice, TextField } from '../../components/ui';
import { resetContent, saveSettings, useSettings } from '../../data/content';

export function SettingsTab({ actor }: { actor: string }) {
  const settings = useSettings();
  const [min, setMin] = useState(String(settings.minOutcomeSampleSize));
  const [demo, setDemo] = useState(settings.demoMode);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const n = Number(min);
    if (!Number.isInteger(n) || n < 1 || n > 10000) {
      setError('Enter a whole number of at least 1.');
      return;
    }
    setError(undefined);
    saveSettings({ minOutcomeSampleSize: n, demoMode: demo }, actor);
    setMessage('Settings saved.');
  }

  return (
    <div className="space-y-6">
      <Card as="section" aria-labelledby="settings-heading" className="space-y-4">
        <h3 id="settings-heading" className="text-xl font-extrabold">
          Settings
        </h3>
        {message && (
          <Notice tone="success" live>
            {message}
          </Notice>
        )}
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <TextField
            label="Minimum sample size for outcome data"
            required
            type="number"
            min={1}
            value={min}
            error={error}
            onChange={(e) => setMin(e.target.value)}
            hint="Outcome records with fewer students than this show “No data yet”."
          />
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={demo}
              onChange={(e) => setDemo(e.target.checked)}
              className="mt-0.5 h-5 w-5 accent-accent"
            />
            <span>
              <span className="font-medium">Demo mode</span>
              <span className="block text-ink-soft">
                Lets students pick “coming soon” goal types (placeholder content).
              </span>
            </span>
          </label>
          <Button type="submit" variant="primary">
            Save settings
          </Button>
        </form>
      </Card>
      <Card as="section" aria-labelledby="reset-heading" className="space-y-3">
        <h3 id="reset-heading" className="text-xl font-extrabold">
          Reset content
        </h3>
        <p className="text-sm text-ink-soft">
          Restores opportunities, goal types, outcomes and settings to the JSON seed files. Student
          accounts and saved plans are not affected. The edit history keeps a record of the reset.
        </p>
        {confirmReset ? (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="danger"
              onClick={() => {
                resetContent(actor);
                setConfirmReset(false);
                setMessage('Content reset to seed data.');
              }}
            >
              Confirm reset
            </Button>
            <Button onClick={() => setConfirmReset(false)}>Cancel</Button>
          </div>
        ) : (
          <Button variant="danger" onClick={() => setConfirmReset(true)}>
            Reset content to seed
          </Button>
        )}
      </Card>
    </div>
  );
}
