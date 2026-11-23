import { useState } from 'react';
import { Button, Card, Notice } from '../../components/ui';
import {
  deleteOutcome,
  importOutcomes,
  useGoalTypes,
  useOpportunities,
  useOutcomes,
  useSettings,
} from '../../data/content';
import { DataQualityBadge } from '../transparency';
import {
  OUTCOME_CSV_COLUMNS,
  OUTCOME_CSV_TEMPLATE,
  parseOutcomesCsv,
  type CsvResult,
} from './outcomesCsv';

export function OutcomesTab({ actor }: { actor: string }) {
  const outcomes = useOutcomes();
  const goals = useGoalTypes();
  const opps = useOpportunities();
  const { minOutcomeSampleSize } = useSettings();
  const [text, setText] = useState('');
  const [result, setResult] = useState<CsvResult | null>(null);
  const [mode, setMode] = useState<'append' | 'replace'>('append');
  const [message, setMessage] = useState('');

  const validate = (csv: string) => {
    setResult(
      parseOutcomesCsv(csv, {
        goalTypeIds: goals.map((g) => g.id),
        opportunityIds: opps.map((o) => o.id),
      }),
    );
    setMessage('');
  };

  async function onFile(file: File | undefined) {
    if (!file) return;
    const content = await file.text();
    setText(content);
    validate(content);
  }

  const canImport = result && result.errors.length === 0 && result.records.length > 0;

  return (
    <div className="space-y-6">
      <Card as="section" aria-labelledby="csv-heading" className="space-y-4">
        <h3 id="csv-heading" className="text-xl font-extrabold">
          Import outcome data (CSV)
        </h3>
        <p className="text-sm text-ink-soft">
          Columns: <code className="break-words">{OUTCOME_CSV_COLUMNS.join(', ')}</code>.{' '}
          <code>id</code> is optional. <code>outcomeRate</code> is 0–1 or a percentage. Records
          below a sample size of {minOutcomeSampleSize} are stored but shown to students as “No data
          yet”.
        </p>
        <a
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(OUTCOME_CSV_TEMPLATE)}`}
          download="vantage-outcomes-template.csv"
          className="inline-block text-sm font-medium text-accent-strong underline"
        >
          Download CSV template
        </a>
        <div className="space-y-1.5">
          <label htmlFor="csv-file" className="block text-sm font-medium">
            Choose a CSV file
          </label>
          <input
            id="csv-file"
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => void onFile(e.target.files?.[0])}
            className="block text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="csv-text" className="block text-sm font-medium">
            …or paste CSV
          </label>
          <textarea
            id="csv-text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setResult(null);
            }}
            className="block min-h-[140px] w-full rounded-input border border-border-strong bg-surface p-3 font-mono text-xs text-navy"
          />
        </div>
        <fieldset className="flex flex-wrap gap-4 text-sm">
          <legend className="mb-1 font-medium">Import mode</legend>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="mode"
              checked={mode === 'append'}
              onChange={() => setMode('append')}
              className="h-4 w-4 accent-accent"
            />
            Add / update by id
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="mode"
              checked={mode === 'replace'}
              onChange={() => setMode('replace')}
              className="h-4 w-4 accent-accent"
            />
            Replace all outcome records
          </label>
        </fieldset>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => validate(text)} disabled={!text.trim()}>
            Validate
          </Button>
          <Button
            variant="primary"
            disabled={!canImport}
            onClick={() => {
              if (!result) return;
              importOutcomes(result.records, mode, actor);
              setMessage(`Imported ${result.records.length} record(s).`);
              setResult(null);
              setText('');
            }}
          >
            Import {result?.records.length ?? 0} record(s)
          </Button>
        </div>
        {result && result.errors.length > 0 && (
          <Notice
            tone="alert"
            live
            title={`${result.errors.length} problem(s) found. Nothing was imported.`}
          >
            <ul className="list-disc space-y-0.5 pl-5" data-testid="csv-errors">
              {result.errors.map((e) => (
                <li key={`${e.line}-${e.message}`}>
                  Line {e.line}: {e.message}
                </li>
              ))}
            </ul>
          </Notice>
        )}
        {result && result.errors.length === 0 && (
          <Notice tone="success" live>
            {result.records.length} valid record(s) ready to import.
          </Notice>
        )}
        {message && (
          <Notice tone="success" live>
            {message}
          </Notice>
        )}
      </Card>

      <section aria-labelledby="outcomes-list-heading" className="space-y-2">
        <h3 id="outcomes-list-heading" className="text-xl font-extrabold">
          Current outcome records ({outcomes.length})
        </h3>
        <ul className="divide-y divide-line rounded-card border border-border bg-surface shadow-soft">
          {outcomes.map((r) => (
            <li
              key={r.id}
              className="flex flex-col gap-2 p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">
                  {opps.find((o) => o.id === r.opportunityId)?.title ?? r.opportunityId}:{' '}
                  {Math.round(r.outcomeRate * 100)}%
                </p>
                <p className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                  <span>
                    n = {r.sampleSize}
                    {r.sampleSize < minOutcomeSampleSize
                      ? ' (below minimum; hidden from students)'
                      : ''}
                  </span>
                  <DataQualityBadge quality={r.dataQuality} />
                  <span>{r.source}</span>
                </p>
              </div>
              <Button size="sm" variant="danger" onClick={() => deleteOutcome(r.id, actor)}>
                Delete<span className="sr-only"> record {r.id}</span>
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
