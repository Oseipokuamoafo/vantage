import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function audit(page: Page, label: string) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const summary = results.violations.map(
    (v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s) — ${v.nodes[0]?.target.join(' ')}`,
  );
  expect(summary, `${label} accessibility violations:\n${summary.join('\n')}`).toEqual([]);
}

test.describe('accessibility (axe, WCAG 2.1 AA)', () => {
  test.use({ reducedMotion: 'reduce' });

  test('landing, compare and planner have no violations', async ({ page }) => {
    await page.goto('./');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await audit(page, 'Landing');

    await page.getByRole('button', { name: 'Try as Devon' }).click();
    await expect(page.getByRole('heading', { name: 'Side-by-side comparison' })).toBeVisible();
    await audit(page, 'Compare');

    await page.goto('./#/plan');
    await expect(page.getByRole('heading', { name: 'Semester-by-semester plan' })).toBeVisible();
    await page
      .getByLabel('Move AWS Certified Solutions Architect – Associate to')
      .selectOption({ label: 'Spring 2027' });
    await page
      .getByLabel('Move Serverless portfolio site on AWS to')
      .selectOption({ label: 'Spring 2027' });
    await audit(page, 'Planner');
  });
});
