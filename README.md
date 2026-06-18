# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# skip-and-loafer

## Netlify Postgres

Set `NETLIFY_DATABASE_URL` in Netlify environment variables to the read/write Postgres connection string. The API also accepts `DATABASE_URL` or `POSTGRES_URL` for local development.

Run `node test-postgres.js` to smoke-test the configured database connection.

### Redis migration

Set both source and destination URLs before running the one-off migration:

```sh
REDIS_URL="redis://..." NETLIFY_DATABASE_URL="postgresql://..." npm run migrate:redis-to-postgres
```

The migration copies:

- `sync:*` keys into `sync_entries`
- `reads:global` counts into `read_counts`
- `quiz:results` into `quiz_results`
- `quiz:leaderboard` into `quiz_leaderboard`
- community and chat key-value data into `app_kv`

The script is idempotent: reruns upsert existing rows instead of creating duplicates.
