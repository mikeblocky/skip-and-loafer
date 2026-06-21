# Skip and Loafer

A warm, fan-made companion site for *Skip and Loafer*. The app brings the manga, anime, characters, community notes, reading progress, and small daily-life tools into one place. It is built as a React and Vite single-page app, with a Cloudflare Worker behind the public routes, a Cloudflare database for community data, and Cloudflare object storage for larger media.

The site is meant to feel like a small personal desk for the series: easy to open, easy to revisit, and useful whether someone wants to track chapters, browse art, read wiki-style notes, leave a message, play a quiz, or make a little camera scrapbook moment.

## What is inside

The app currently includes these main areas:

- **Home and planner**: a soft landing area for quick links, gentle prompts, and daily companion-style content.
- **Chapters**: manga tracking, finished-state controls, read counts, and a reading-focused subview.
- **Gallery**: image and media browsing for series-related material.
- **Community**: fan gallery uploads and fan messages, backed by Cloudflare routes.
- **Blog**: longer written pieces and updates.
- **Quiz**: quiz play with results and leaderboard support.
- **Mystery**: character and relationship-style discovery content.
- **Sticker Cam**: a camera and snapshot editor for placing stickers, drawing, exporting images, and making small keepsakes.
- **Birthdays**: character birthday information and date-based reminders.
- **Settings and guide**: app controls, accessibility options, language preferences, install/offline controls, sync tools, and tutorial content.

Some pages have grouped subviews rather than separate top-level tabs. For example, Chapters includes the Reading view, Community includes Fan gallery and Fan messages, and Settings includes the Guide.

## App features

- React 19 and Vite power the frontend.
- Framer Motion handles much of the page motion and interaction polish.
- Lucide icons are used throughout the interface.
- Markdown content is rendered with `react-markdown` and GitHub-flavored Markdown support.
- Sticker Cam uses MediaPipe vision tasks, canvas interactions, image export, and gif tooling.
- Offline support is handled through the service worker and a generated build asset manifest.
- Accessibility preferences are stored locally, including motion, contrast, text size, spacing, dark mode, visual simplification, and color-blind modes.
- Sync features use short keys so reading and usage data can move between devices.
- The deployed app uses security headers from the Cloudflare Worker, including content policy, frame protection, referrer policy, and permissions policy.

## Cloudflare architecture

The production site runs on Cloudflare Workers with static assets. The Worker serves both the built app and the public routes.

Cloudflare pieces:

- **Worker Static Assets** serves the Vite `dist` build.
- **Cloudflare database** stores sync records, read counts, quiz results, community signatures, and fan gallery records.
- **Media bucket** stores large media files that are too big for Workers Static Assets.
- **Fan gallery bucket** stores uploaded fan gallery images.
- **Worker-first asset routing** keeps security headers on app and asset responses.

The Worker currently handles these routes:

- `post /api/sync/create`
- `get /api/sync/claim`
- `post /api/reads/increment`
- `get /api/reads/top`
- `get /api/quiz/leaderboard`
- `post /api/quiz/results`
- `get /api/community/signatures`
- `post /api/community/signatures`
- `get /api/community/fan-gallery`
- `post /api/community/fan-gallery`
- `get /api/community/fan-gallery/images/:id`
- `get /api/geo/country`

Large media is served from object storage when it cannot be bundled into the normal static asset upload. This includes `public/anime/episode1.mp4` and musical gallery videos.

## Project structure

```txt
src/
  components/       Shared UI pieces
  features/         Feature modules and app shell logic
  pages/            Main page components
  assets/           Frontend assets imported by the app
public/
  anime/            Anime media and related public assets
  gallery/          Gallery assets
  sw.js             Service worker
worker/
  index.js          Cloudflare Worker and route handlers
migrations/
  0001_initial.sql  Database schema
scripts/
  write-cloudflare-assetsignore.js
  run-pwa-smoke.mjs
```

The visible app tabs are defined in `src/features/app/appConstants.js`. Page loading and lazy-loaded route components live around `src/features/app/AppTabContent.jsx` and `src/features/app/appPageLoaders.js`.

## Development

Install dependencies:

```sh
npm install
```

Start the Vite dev server:

```sh
npm run dev
```

The Vite config includes local route middleware so the main sync, reading, quiz, and community flows can be exercised during development without deploying every change.

## Build

Create a production build:

```sh
npm run build
```

Preview the built app locally:

```sh
npm run preview
```

Run linting:

```sh
npm run lint
```

Run the install and offline smoke check:

```sh
npm run test:pwa
```

Run WebKit tests:

```sh
npm run test:webkit
```

## Cloudflare setup

Create the Cloudflare resources once:

```sh
npx wrangler d1 create skip-and-loafer
npx wrangler r2 bucket create skip-and-loafer-media
npx wrangler r2 bucket create skip-and-loafer-fan-gallery
```

Copy the database id into `wrangler.jsonc`, then apply the database schema:

```sh
npm run db:migrate:remote
```

For local database testing, apply the migration locally:

```sh
npm run db:migrate:local
```

Upload large media to object storage instead of bundling it into Workers Static Assets:

```sh
npx wrangler r2 object put skip-and-loafer-media/anime/episode1.mp4 --file public/anime/episode1.mp4
```

Run the Worker locally:

```sh
npm run cloudflare:dev
```

Deploy to Cloudflare:

```sh
npm run cloudflare:deploy
```

The deploy script builds the Vite app, writes the Cloudflare asset ignore file, and runs `wrangler deploy`.

## Offline and install behavior

The app is designed to behave like an installable companion site. The service worker caches the app shell and generated build assets, while heavier media stays explicit and Cloudflare-backed. This keeps the app quick to open without forcing large downloads onto every visitor.

The generated `offline-build-assets.json` file is emitted during the Vite build and used by the offline flow. Install and offline controls are surfaced inside Settings.

## Data and privacy notes

Most personal app state lives in the browser through local storage. Sync uses a short key to move selected data between devices. Community posts, fan gallery entries, quiz results, and shared read statistics use Cloudflare routes and are stored in the database or object storage as needed.

The Worker validates write requests, limits body sizes, checks allowed image types, and only allows same-origin writes for protected routes.

## Useful commands

```sh
npm run dev
npm run build
npm run preview
npm run lint
npm run test:pwa
npm run test:webkit
npm run db:migrate:local
npm run db:migrate:remote
npm run cloudflare:dev
npm run cloudflare:deploy
```

## Notes for future work

When adding features, prefer connecting the existing surfaces before adding a new top-level tab. The app already has many places to grow: reading progress, daily planner ideas, birthdays, community sharing, Sticker Cam, mystery content, and synced Settings all work better when they feel connected.

For media-heavy additions, keep large files in object storage and keep automatic offline caching focused on the app shell and small build assets.
