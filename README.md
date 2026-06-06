# Nature Coast Pulse

Interactive local guide and weekly briefing MVP for Florida's Nature Coast.

Live site: https://florida-guide-zeta.vercel.app/

GitHub: https://github.com/throb/florida-nature-coast-guide

## Product Shape

This started as a relocation guide and is now the first City Pulse-style local site:

- Place of the week
- Branded weekly "This Week" issue surface
- Live weather pulse
- Curated field guide with filters
- Day-trip builder
- Meet-people and moving-here sections
- Advertiser package
- Source map and weekly operating workflow

## Deploy

Vercel imports this repository directly. Changes pushed to `main` redeploy automatically.

## Live App Foundation

The site now has a City Pulse data layer:

- `data/nature-coast.seed.json` is the local fallback and pilot content seed.
- `api/city-pulse.js` serves published Supabase rows when env vars are present, and falls back to seed data if Supabase is not configured yet.
- `api/cron/weekly-draft.js` is the Monday scheduled draft generator declared in `vercel.json`.
- `supabase/schema.sql` defines the draft-first content model for cities, places, day trips, weekly issues, sources, and source candidates.
- `npm run draft:weekly` creates a review draft in `data/drafts/`.
- `npm run sync:supabase` syncs the seed into Supabase after `schema.sql` has been applied.

Required Supabase env vars for live mode:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Next Ops Step

Apply the Supabase schema, sync the Nature Coast seed, then add the weekly source sweep that writes source candidates as drafts for review.

## Template Direction

The current page uses the offline "Nature Coast Pulse — This Week" template as brand direction: blue/cream pulse mark, weekly issue framing, quick-card issue highlights, and a site-first newsletter archive model.
