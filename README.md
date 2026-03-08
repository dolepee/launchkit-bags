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
- the app currently uses a JSON store, so it needs a persistent disk on Render
- `LAUNCHKIT_DATA_DIR` points the app at the mounted disk path
- first boot seeds the mounted data path from `data/launchkit-store.json`, so the demo kit is available immediately

Relevant Render docs:

- `https://render.com/docs/deploy-nextjs-app`
- `https://render.com/docs/web-services`
- `https://render.com/docs/disks`
- `https://render.com/docs/deploys`

## Why Render works now

Render can run the app as a normal Next.js Node server. That makes it a better short-term fit than GitHub Pages and a simpler fit than Vercel while the app still writes to a local data store.

## Longer-term production direction

The JSON store is acceptable for MVP demos, but it should be replaced with a real datastore before treating this as production infrastructure.
