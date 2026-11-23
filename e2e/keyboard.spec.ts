import { expect, test } from '@playwright/test';

test('Priya: keyboard-only drag-and-drop places an opportunity in a semester', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'desktop', 'Keyboard flow is checked once on desktop.');
  await page.goto('./');

  // Reach the persona button with the keyboard only.
  const priya = page.getByRole('button', { name: 'Try Vantage as Priya' });
  for (let i = 0; i < 80 && !(await priya.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press('Tab');
  }
  await expect(priya).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Side-by-side comparison' })).toBeVisible();

  await page.getByRole('link', { name: 'Plan', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Semester-by-semester plan' })).toBeVisible();

  const handle = page.getByRole('button', { name: /Drag AWS Certified Solutions Architect/ });
  await handle.focus();
  await page.keyboard.press('Space');
  // dnd-kit marks the active handle as pressed while it is being dragged.
  await expect(handle).toHaveAttribute('aria-pressed', 'true');
  for (let i = 0; i < 14; i++) await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Space');
  await expect(handle).not.toHaveAttribute('aria-pressed', 'true');

  const placed = page
    .locator('[data-testid^="term-"]')
    .getByText('AWS Certified Solutions Architect – Associate');
  await expect(placed).toHaveCount(1);

  // The "Move to" menu is a keyboard alternative to dragging.
  const move = page.getByLabel('Move AWS Certified Solutions Architect – Associate to');
  await move.focus();
  await move.selectOption({ label: 'Tray (unplanned)' });
  await expect(placed).toHaveCount(0);
});
