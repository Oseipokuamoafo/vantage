// Lint-style guard: fails the build if any UI string or seed record uses prescriptive language.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { findForbidden } from './forbiddenPhrases';

const ROOT = join(__dirname, '..', '..', '..');
const SCAN_DIRS = ['src'];
const SCAN_FILES = ['index.html'];
const EXCLUDE = [/\.test\.tsx?$/, /forbiddenPhrases\.ts$/, /src[\\/]test[\\/]/];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return walk(p);
    return /\.(tsx?|json|html|css)$/.test(name) ? [p] : [];
  });
}

describe('forbidden prescriptive phrases', () => {
  it('detects phrases in sample text', () => {
    expect(findForbidden('This is the best option')).toContain('best');
    expect(findForbidden('We recommend this')).toContain('recommend');
    expect(findForbidden('You should do X')).toContain('you should');
    expect(findForbidden('Compare trade-offs')).toEqual([]);
  });

  it('finds none in UI source, seed data or index.html', () => {
    const files = [
      ...SCAN_DIRS.flatMap((d) => walk(join(ROOT, d))),
      ...SCAN_FILES.map((f) => join(ROOT, f)),
    ].filter((f) => !EXCLUDE.some((re) => re.test(f)));
    expect(files.length).toBeGreaterThan(20);
    const violations: string[] = [];
    for (const file of files) {
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          const hits = findForbidden(line);
          if (hits.length) violations.push(`${relative(ROOT, file)}:${i + 1} → ${hits.join(', ')}`);
        });
    }
    expect(violations, `Prescriptive language found:\n${violations.join('\n')}`).toEqual([]);
  });
});
