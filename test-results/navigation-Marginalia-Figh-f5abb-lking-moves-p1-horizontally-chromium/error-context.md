# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Marginalia Fighters — navigation flow >> walking moves p1 horizontally
- Location: e2e/navigation.spec.ts:31:7

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 89.4921875
Received:   74.4921875
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - generic [ref=e7]:
      - img "The Battle Meadow" [ref=e8]
      - generic: PRIEL — IN PRATO PROELIO
    - generic:
      - generic:
        - img "The Rabbit on the Snail"
    - generic:
      - generic:
        - img "The Knight"
    - generic:
      - generic:
        - generic:
          - generic:
            - generic: Domesticus Velox
            - generic: ○○
        - generic:
          - generic: "58"
          - text: ROUND I
        - generic:
          - generic:
            - generic: ○○
            - generic: Miles Errans
    - generic:
      - generic:
        - generic: ✝
        - generic: ✝
        - generic: ✝
        - generic: ✝
  - paragraph [ref=e10]: A/D walk · W jump · S crouch · hold back to block · F/G strikes · H heavy · J projectile · B special (50⚜) · N mercy (100⚜) · Esc quit
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Marginalia Fighters — navigation flow', () => {
  4  |   test('home page shows the incipit and roster', async ({ page }) => {
  5  |     await page.goto('/');
  6  |     await expect(page.getByTestId('home')).toBeVisible();
  7  |     await expect(page.getByText('Marginalia Fighters')).toBeVisible();
  8  |     await expect(page.getByRole('link', { name: 'Begin the Combat' })).toBeVisible();
  9  |   });
  10 | 
  11 |   test('start button leads to character select', async ({ page }) => {
  12 |     await page.goto('/');
  13 |     await page.getByTestId('start-btn').click();
  14 |     await expect(page.getByTestId('select')).toBeVisible();
  15 |     await expect(page.getByTestId('roster')).toBeVisible();
  16 |   });
  17 | 
  18 |   test('pick characters, stage and enter the fight', async ({ page }) => {
  19 |     await page.goto('/select');
  20 |     await page.getByTestId('pick-nun').click();
  21 |     await page.getByTestId('pick-jester').click();
  22 |     await page.getByTestId('stage-grotesque').click();
  23 |     await page.getByTestId('fight-btn').click();
  24 | 
  25 |     await expect(page.getByTestId('arena')).toBeVisible();
  26 |     await expect(page.getByTestId('fighter-p1')).toBeVisible();
  27 |     await expect(page.getByTestId('fighter-p2')).toBeVisible();
  28 |     await expect(page.getByTestId('hud')).toBeVisible();
  29 |   });
  30 | 
  31 |   test('walking moves p1 horizontally', async ({ page }) => {
  32 |     await page.goto('/select');
  33 |     // Turn the CPU off so p2 doesn't shove p1 back during the measurement.
  34 |     await page.getByTestId('cpu-toggle').uncheck();
  35 |     await page.getByTestId('fight-btn').click();
  36 |     await expect(page.getByTestId('announce')).toHaveText('PUGNA!');
  37 |     await page.waitForTimeout(1800); // let the intro pass — input is locked during it
  38 | 
  39 |     const before = await page.getByTestId('fighter-p1').boundingBox();
  40 |     await page.keyboard.down('KeyD');
  41 |     await page.waitForTimeout(600);
  42 |     await page.keyboard.up('KeyD');
  43 |     const after = await page.getByTestId('fighter-p1').boundingBox();
  44 | 
> 45 |     expect(after!.x).toBeGreaterThan(before!.x + 30);
     |                      ^ Error: expect(received).toBeGreaterThan(expected)
  46 |   });
  47 | 
  48 |   test('timer counts down during the round', async ({ page }) => {
  49 |     await page.goto('/select');
  50 |     await page.getByTestId('fight-btn').click();
  51 |     const timer = page.getByTestId('timer');
  52 |     const first = Number(await timer.textContent());
  53 |     await page.waitForTimeout(2500);
  54 |     const later = Number(await timer.textContent());
  55 |     expect(later).toBeLessThan(first);
  56 |   });
  57 | 
  58 |   test('escape returns to select screen', async ({ page }) => {
  59 |     await page.goto('/select');
  60 |     await page.getByTestId('fight-btn').click();
  61 |     await page.keyboard.press('Escape');
  62 |     await expect(page.getByTestId('select')).toBeVisible();
  63 |   });
  64 | });
  65 | 
```