# Development

## Local CI

This project includes a local Agent CI runner setup based on
`bebraw/vibe-template`.

Run the same workflow shape locally:

```bash
npm run ci:local
```

For less output:

```bash
npm run ci:local:quiet
```

If local Agent CI cannot infer the repository, copy `.env.agent-ci.example` to
`.env.agent-ci` and set `GITHUB_REPO`.

## Lighthouse

Install the pinned Chromium browser once if your machine does not already have a
Chrome installation available:

```bash
npm run playwright:install
```

Build the site, start a local static server, and audit the homepage:

```bash
npm run lighthouse:local
```

Audit an already-running URL:

```bash
LIGHTHOUSE_URL=http://127.0.0.1:3000 npm run lighthouse
```

Reports are written under `reports/lighthouse/` as `mobile.html`,
`desktop.html`, matching JSON files, and `summary.json`.

Useful overrides:

```bash
LIGHTHOUSE_MIN_PERFORMANCE_SCORE=95 npm run lighthouse:local
LIGHTHOUSE_URL=https://survivejs.com/ npm run lighthouse
```
