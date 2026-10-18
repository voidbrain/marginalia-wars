# Deploying to GitHub Pages

Your repo's Pages settings publish the **`gh-pages` branch**, so deployment just needs the built app pushed there. Two wired-up paths:

## Option A — CI (recommended)
`.github/workflows/deploy.yml` runs on every push to `main`:
1. `npm ci` → lint → unit tests
2. `ng build --base-href /<repo>/` (correct base href for project pages, derived from `GITHUB_REPOSITORY`)
3. Copies `index.html` → `404.html` so SPA deep links (`/arena`) work on Pages
4. Pushes `dist/marginalia-fighters/browser` to the `gh-pages` branch via `peaceiris/actions-gh-pages@v4` (uses the built-in `GITHUB_TOKEN`, no secrets needed).

You can also trigger it manually: **Actions → Deploy to GitHub Pages → Run workflow**.

## Option B — Local one-shot deploy
```bash
npx ng build --base-href /<your-repo-name>/   # produces dist/marginalia-fighters/browser
cp dist/marginalia-fighters/browser/index.html dist/marginalia-fighters/browser/404.html
npm run deploy:local                          # ngh --dir=dist/marginalia-fighters/browser
```
`ngh` (angular-cli-ghpages, a devDependency) commits the output to `gh-pages` and pushes it. Requires push access to the repo.

## Troubleshooting
- **Blank page / assets 404** → wrong base href; rebuild with `--base-href /<repo>/`.
- **Deep link 404s** → make sure `404.html` is in the published folder (both options above add it).
- **Workflow fails pushing gh-pages** → repo Settings → Pages must allow Actions, and the workflow has `permissions: contents: write` already set.
