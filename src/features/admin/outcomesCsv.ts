import type { DataQuality, OutcomeRecord } from '../../data/types';
import { parseCSV } from './csv';

export const OUTCOME_CSV_COLUMNS = [
  'id',
  'goalTypeId',
  'opportunityId',
  'metric',
  'outcomeRate',
  'sampleSize',
  'cohort',
  'source',
  'dataQuality',
] as const;

const REQUIRED = OUTCOME_CSV_COLUMNS.filter((c) => c !== 'id');
const QUALITIES: DataQuality[] = ['sourced', 'limited', 'team_estimate'];

export const OUTCOME_CSV_TEMPLATE =
  `${OUTCOME_CSV_COLUMNS.join(',')}\n` +
  'out-example,cloud-internship,aws-saa,Reported a cloud or SWE internship offer within 12 months,0.4,15,Sample cohort,Prototype sample data: not real statistics,team_estimate\n';

export interface CsvError {
  line: number;
  message: string;
}

export interface CsvResult {
  records: OutcomeRecord[];
  errors: CsvError[];
}

export function parseOutcomesCsv(
  text: string,
  known: { goalTypeIds: string[]; opportunityIds: string[] },
): CsvResult {
  const rows = parseCSV(text);
  if (!rows.length) return { records: [], errors: [{ line: 1, message: 'The file is empty.' }] };
  const header = rows[0]!.map((h) => h.trim());
  const missing = REQUIRED.filter((c) => !header.includes(c));
  if (missing.length) {
    return {
      records: [],
      errors: [{ line: 1, message: `Missing column(s): ${missing.join(', ')}` }],
    };
  }
  const col = (r: string[], name: string) => (r[header.indexOf(name)] ?? '').trim();

  const records: OutcomeRecord[] = [];
  const errors: CsvError[] = [];
  const seen = new Set<string>();

  rows.slice(1).forEach((r, i) => {
    const line = i + 2;
    const rowErrors: string[] = [];
    const goalTypeId = col(r, 'goalTypeId');
    const opportunityId = col(r, 'opportunityId');
    const metric = col(r, 'metric');
    const rateRaw = col(r, 'outcomeRate');
    const nRaw = col(r, 'sampleSize');
    const source = col(r, 'source');
    const dataQuality = col(r, 'dataQuality') as DataQuality;

    if (!known.goalTypeIds.includes(goalTypeId))
      rowErrors.push(`unknown goalTypeId "${goalTypeId}"`);
    if (!known.opportunityIds.includes(opportunityId))
      rowErrors.push(`unknown opportunityId "${opportunityId}"`);
    if (!metric) rowErrors.push('metric is required');
    let rate = rateRaw.endsWith('%') ? Number(rateRaw.slice(0, -1)) / 100 : Number(rateRaw);
    if (rateRaw === '' || !Number.isFinite(rate) || rate < 0 || rate > 1) {
      rowErrors.push('outcomeRate must be between 0 and 1 (or 0%–100%)');
      rate = NaN;
    }
    const n = Number(nRaw);
    if (!Number.isInteger(n) || n < 1)
      rowErrors.push('sampleSize must be a whole number of at least 1');
    if (!source) rowErrors.push('source is required');
    if (!QUALITIES.includes(dataQuality))
      rowErrors.push(`dataQuality must be one of ${QUALITIES.join(', ')}`);

    const id = col(r, 'id') || `out-${opportunityId}-${line}`;
    if (seen.has(id)) rowErrors.push(`duplicate id "${id}" in this file`);
    seen.add(id);

    if (rowErrors.length) {
      errors.push({ line, message: rowErrors.join('; ') });
      return;
    }
    records.push({
      id,
      goalTypeId,
      opportunityId,
      metric,
      outcomeRate: rate,
      sampleSize: n,
      cohort: col(r, 'cohort') || 'Unspecified cohort',
      source,
      dataQuality,
    });
  });

  if (rows.length === 1) errors.push({ line: 2, message: 'No data rows found below the header.' });
  return { records, errors };
}
