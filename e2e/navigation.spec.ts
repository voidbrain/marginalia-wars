import { test, expect } from '@playwright/test';
import { enterFight, fighterX } from './fight';

test.describe('Marginalia Fighters — navigation flow', () => {
  test('home page shows the incipit and roster', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('home')).toBeVisible();
    await expect(page.getByText('Marginalia Fighters')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Begin the Combat' })).toBeVisible();
  });

  test('start button leads to character select', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('start-btn').click();
    await expect(page.getByTestId('select')).toBeVisible();
    await expect(page.getByTestId('roster')).toBeVisible();
  });

  test('pick characters, stage and enter the fight', async ({ page }) => {
    await page.goto('/select');
    await page.getByTestId('pick-nun').click();
    await page.getByTestId('pick-jester').click();
    await page.getByTestId('stage-grotesque').click();
    await page.getByTestId('fight-btn').click();

    await expect(page.getByTestId('arena')).toBeVisible();
    await expect(page.getByTestId('fighter-p1')).toBeVisible();
    await expect(page.getByTestId('fighter-p2')).toBeVisible();
    await expect(page.getByTestId('hud')).toBeVisible();
  });

  test('walking moves p1 horizontally', async ({ page }) => {
    // CPU off so p2 doesn't shove p1 back during the measurement.
    await enterFight(page, { cpu: false });
    const before = await fighterX(page, 'p1');
    await page.keyboard.down('KeyD');
    await expect.poll(() => fighterX(page, 'p1'), { timeout: 5000 }).toBeGreaterThan(before + 40);
    await page.keyboard.up('KeyD');
  });

  test('timer counts down during the round', async ({ page }) => {
    await page.goto('/select');
    await page.getByTestId('fight-btn').click();
    const timer = page.getByTestId('timer');
    const first = Number(await timer.textContent());
    await expect
      .poll(async () => Number(await timer.textContent()), { timeout: 10_000 })
      .toBeLessThan(first);
  });

  test('escape returns to select screen', async ({ page }) => {
    await page.goto('/select');
    await page.getByTestId('fight-btn').click();
    // The arena listens for Escape once it exists; a key pressed earlier lands on /select.
    await expect(page.getByTestId('arena')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('select')).toBeVisible();
  });
});
