// Phrases that would turn decision support into prescription.
// The forbidden-phrase test scans all UI source and seed data for these.
export const FORBIDDEN_PATTERNS: { pattern: RegExp; phrase: string }[] = [
  { pattern: /\byou should\b/i, phrase: 'you should' },
  { pattern: /\bshould you\b/i, phrase: 'should you' },
  { pattern: /\bbest\b/i, phrase: 'best' },
  { pattern: /\brecommend/i, phrase: 'recommend' },
  { pattern: /\bwinner/i, phrase: 'winner' },
  { pattern: /\btop pick/i, phrase: 'top pick' },
  { pattern: /\btop choice/i, phrase: 'top choice' },
  { pattern: /\bmust[- ]do\b/i, phrase: 'must-do' },
  { pattern: /\boptimal\b/i, phrase: 'optimal' },
  { pattern: /\bideal choice\b/i, phrase: 'ideal choice' },
  { pattern: /\bright choice\b/i, phrase: 'right choice' },
  { pattern: /\bwe suggest\b/i, phrase: 'we suggest' },
  { pattern: /\bclear favorite\b/i, phrase: 'clear favorite' },
];

export function findForbidden(text: string): string[] {
  return FORBIDDEN_PATTERNS.filter(({ pattern }) => pattern.test(text)).map((p) => p.phrase);
}
