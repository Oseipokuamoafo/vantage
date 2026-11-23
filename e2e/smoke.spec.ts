import { expect, test, type Page } from '@playwright/test';

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
}

test('Marcus: onboard, set goal and constraints, compare 3, save, reload, plan persists', async ({
  page,
}) => {
  await page.goto('./');
  await expect(page.getByText('Prototype:')).toBeVisible();
  await expectNoHorizontalScroll(page);

  // Onboard as the Marcus demo persona.
  await page.getByRole('button', { name: 'Try Vantage as Marcus' }).click();
  await expect(page.getByRole('heading', { name: 'Opportunity catalog' })).toBeVisible();

  // Pick the goal.
  await page.getByRole('link', { name: 'Goal', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'What are you working toward?' })).toBeVisible();
  await page.getByRole('radio', { name: /Cloud engineering internship/ }).check();
  await page.getByRole('button', { name: 'Save goal' }).click();
  await expect(page.getByText('Goal saved.')).toBeVisible();

  // Set constraints.
  await page.getByRole('link', { name: 'Constraints', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'What you have to work with' })).toBeVisible();
  await page.getByLabel(/Hours available per week/).fill('8');
  await page.getByLabel(/Budget \(USD\)/).fill('100');
  await page.getByLabel(/Semesters remaining/).fill('5');
  await page.getByRole('button', { name: 'Save constraints' }).click();
  await expect(page.getByText('Constraints saved.')).toBeVisible();

  // Add three opportunities to the comparison from the catalog.
  await page.getByRole('link', { name: 'Explore', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Opportunity catalog' })).toBeVisible();
  for (const title of [
    'AWS Certified Cloud Practitioner',
    'Serverless portfolio site on AWS',
    'Student cloud computing club',
  ]) {
    await page.getByRole('button', { name: `Add to comparison for ${title}` }).click();
  }
  await expectNoHorizontalScroll(page);

  await page.getByRole('link', { name: 'Compare', exact: true }).click();
  const table = page.getByRole('table');
  await expect(table.getByRole('columnheader')).toHaveCount(4); // attribute column + 3
  // Every rating carries an explanation and a data-quality label.
  await expect(table.getByText('Driven by:')).toHaveCount(12); // 3 attributes + summary, × 3 columns
  await expect(table.getByText(/Team estimate|Limited data|Sourced/).first()).toBeVisible();

  // Save the plan.
  await page.getByLabel('Save as a new plan').fill('Marcus smoke plan');
  await page.getByRole('button', { name: 'Save plan' }).click();
  await expect(page.getByText('Saved “Marcus smoke plan”.')).toBeVisible();

  // Reload and confirm it persisted.
  await page.reload();
  await expect(page.getByRole('table').getByRole('columnheader')).toHaveCount(4);
  await page.getByRole('link', { name: 'Saved', exact: true }).click();
  const plan = page.getByTestId('saved-plan');
  await expect(plan).toHaveCount(1);
  await expect(plan.getByRole('heading', { name: 'Marcus smoke plan' })).toBeVisible();
  await expect(plan.getByText('Student cloud computing club')).toBeVisible();
  await expectNoHorizontalScroll(page);
});
