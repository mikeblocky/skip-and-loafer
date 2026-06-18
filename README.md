# skip-and-loafer

React/Vite fan site with Cloudflare Workers, D1, and R2-backed community APIs.

## Development

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

## Cloudflare

Create the Cloudflare resources once:

```sh
npx wrangler d1 create skip-and-loafer
npx wrangler r2 bucket create skip-and-loafer-media
npx wrangler r2 bucket create skip-and-loafer-fan-gallery
```

Copy the D1 `database_id` into `wrangler.jsonc`, then apply the schema:

```sh
npm run db:migrate:remote
```

Upload the large episode video to R2 because Workers Static Assets have a 25 MiB per-file limit:

```sh
npx wrangler r2 object put skip-and-loafer-media/anime/episode1.mp4 --file public/anime/episode1.mp4
```

Run the Cloudflare Worker locally:

```sh
npm run db:migrate:local
npm run cloudflare:dev
```

Deploy:

```sh
npm run cloudflare:deploy
```
