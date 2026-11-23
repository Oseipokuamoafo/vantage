import type { Page } from '@playwright/test';

/** Follows a main-nav link; on narrow screens the links live in the menu sheet. */
export async function goTo(page: Page, name: string) {
  const menu = page.getByRole('button', { name: 'Open menu' });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name, exact: true })
    .click();
}
