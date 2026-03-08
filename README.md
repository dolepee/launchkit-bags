# LaunchKit Bags

Standalone Bags-native launch studio for turning builder outreach into approved launch kits.

## Current product shape

- public landing page
- operator studio
- builder review flow
- public launch room
- file-backed MVP store under `data/launchkit-store.json`

## Local development

1. `npm ci`
2. `npm run dev`
3. open `http://localhost:3000`

## Render deployment

This repo includes a `render.yaml` for deployment as a Render web service.

Important:

- deploy as a `web` service, not a static site
- this `render.yaml` is configured for the free Render plan
- the app still uses a JSON store, so saved edits and review state are ephemeral on free Render instances
- the bundled `data/launchkit-store.json` seed makes the demo kit available on boot, but runtime changes can reset after redeploy or service sleep

Relevant Render docs:

- `https://render.com/docs/deploy-nextjs-app`
- `https://render.com/docs/web-services`
- `https://render.com/docs/free`
- `https://render.com/docs/deploys`

## Environment variables

- `BAGS_API_KEY`: required for the Bags `create-token-info` API call
- `LAUNCHKIT_OPERATOR_KEY`: required by the studio to authorize token-info generation
- `BAGS_API_BASE_URL`: optional, defaults to `https://public-api-v2.bags.fm/api/v1`

## Why Render works now

Render can run the app as a normal Next.js Node server. That makes it a better short-term fit than GitHub Pages. The free plan is enough to get the app off the VPS IP quickly, even though state persistence is limited.

## Longer-term production direction

The JSON store is acceptable for MVP demos, but it should be replaced with a real datastore before treating this as production infrastructure. Once that is done, Render or Vercel both become cleaner long-term hosts.
