import { test, expect } from '@playwright/test';

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
    await page.goto('/select');
    // Turn the CPU off so p2 doesn't shove p1 back during the measurement.
    await page.getByTestId('cpu-toggle').uncheck();
    await page.getByTestId('fight-btn').click();
    await expect(page.getByTestId('announce')).toHaveText('PUGNA!');
    await page.waitForTimeout(1800); // let the intro pass — input is locked during it

    // Measure engine position via the sprite's center-x (the wrapper div is a
    // full-size overlay; only the inner sprite box tracks the fighter).
    const centerX = async () => {
      const b = await page.getByTestId('fighter-p1').locator('.sprite').boundingBox();
      return b!.x + b!.width / 2;
    };
    const before = await centerX();
    await page.keyboard.down('KeyD');
    await page.waitForTimeout(900);
    await page.keyboard.up('KeyD');
    const after = await centerX();

    expect(after).toBeGreaterThan(before + 40);
  });

  test('timer counts down during the round', async ({ page }) => {
    await page.goto('/select');
    await page.getByTestId('fight-btn').click();
    const timer = page.getByTestId('timer');
    const first = Number(await timer.textContent());
    await page.waitForTimeout(2500);
    const later = Number(await timer.textContent());
    expect(later).toBeLessThan(first);
  });

  test('escape returns to select screen', async ({ page }) => {
    await page.goto('/select');
    await page.getByTestId('fight-btn').click();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('select')).toBeVisible();
  });
});
