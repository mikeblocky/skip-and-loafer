WebKit test setup

Commands:

- `npm run test:webkit`
- `npm run test:webkit:headed`
- `npm run test:webkit:ui`

First-time browser install:

- `npx playwright install webkit`

What this gives you:

- a local Playwright runner configured for WebKit
- a reusable smoke test entrypoint for Safari-like regressions
- a dev server auto-started on `127.0.0.1:4173`

Limits:

- Playwright WebKit is close to Safari, but not identical to iPhone Safari
- for final verification of iOS-only bugs, still use a real-device service like BrowserStack
