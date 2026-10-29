import { expect, type Page } from '@playwright/test';

/**
 * Shared steps for specs that play a round. Waits are on game state, never on
 * wall-clock time: the arena caps a frame at 50 ms, so on a slow runner game
 * time lags real time and a fixed sleep can end inside the intro.
 */

/** From /select into the arena; with `cpu: false`, p2 stands still. */
export async function enterFight(page: Page, { cpu }: { cpu: boolean }): Promise<void> {
  await page.goto('/select');
  if (!cpu) await page.getByTestId('cpu-toggle').uncheck();
  await page.getByTestId('fight-btn').click();
  await expect(page.getByTestId('arena')).toBeVisible();
  await waitForIntro(page);
}

/** The PUGNA! intro ignores input; it is over when its announcement is gone. */
async function waitForIntro(page: Page): Promise<void> {
  await expect(page.getByTestId('announce')).toHaveText('PUGNA!');
  await expect(page.getByTestId('announce')).toBeHidden({ timeout: 10_000 });
}

/** A fighter's engine x in stage pixels (the fighter box is positioned at it). */
export function fighterX(page: Page, side: 'p1' | 'p2'): Promise<number> {
  return page
    .getByTestId(`fighter-${side}`)
    .evaluate((el) => parseFloat((el as HTMLElement).style.left));
}

/** A fighter's HP bar, in percent. */
export function hpPct(page: Page, side: 'p1' | 'p2'): Promise<number> {
  return page
    .getByTestId(`hp-${side}`)
    .evaluate((el) => parseFloat((el as HTMLElement).style.width));
}
