# Nature Coast Pulse Live System Plan

This is the detailed Codex handoff for turning Nature Coast Pulse from a static MVP into a living City Pulse-style local guide.

## Current State

Repo: `throb/florida-nature-coast-guide`

Live site: `https://florida-guide-zeta.vercel.app/`

Current implementation:

- One main static page: `index.html`
- Vercel serverless API layer:
  - `api/city-pulse.js`
  - `api/subscribe.js`
  - `api/cron/weekly-draft.js`
- Seed data:
  - `data/nature-coast.seed.json`
  - `data/drafts/2026-06-06.json`
- Supabase contract:
  - `supabase/schema.sql`
- Utility scripts:
  - `scripts/check-data.mjs`
  - `scripts/sync-supabase.mjs`
  - `scripts/weekly-draft.mjs`

The page already loads from `/api/city-pulse?city=nature-coast` when available and falls back to inline/seed behavior if the live API is not configured.

## Product Direction

Nature Coast first. City Pulse future-proofed underneath.

This should become a reusable local media operating system:

- Local field guide
- Weekly issue/archive
- Day trip builder
- Source sweep and candidate queue
- EmailOctopus list growth
- Draft-first publishing
- Sponsor-ready placements
- Reusable data model for later cities

The rule: AI can draft, collect, rank, and summarize. Publishing should stay draft-first until a human approves it.

## Decisions Already Made

- Use Supabase as the canonical app data layer.
- Use EmailOctopus for the email list.
- Build the source list ourselves.
- Update all content lanes, not just day trips:
  - places
  - source candidates
  - weekly issue
  - day trips
  - newsletter/archive
  - EmailOctopus signup
  - weather context
- Nature Coast is city one.
- City Pulse portability matters, but do not overbuild multi-city abstractions before Nature Coast works end to end.

## Environment Variables

Required in Vercel:

```bash
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
EMAILOCTOPUS_API_KEY=
EMAILOCTOPUS_LIST_ID=
```

Optional:

```bash
EMAILOCTOPUS_STATUS=
CRON_SECRET=
```

Notes:

- Leave `EMAILOCTOPUS_STATUS` unset unless there is a specific reason to force `PENDING` or `SUBSCRIBED`.
- If `CRON_SECRET` is set, scheduled/manual calls to `/api/cron/weekly-draft` must include `Authorization: Bearer <secret>`.
- API keys should live in Vercel and local shell config, not committed files.

## Architecture

### Frontend

Keep the current page working while the backend matures.

Current behavior:

- `index.html` renders the branded Nature Coast Pulse page.
- `loadCityPulseData()` fetches `/api/city-pulse?city=nature-coast`.
- If the API fails, the page still renders from inline fallback content.
- Signup form posts to `/api/subscribe`.
- If EmailOctopus is not configured, signup is saved locally and the user sees a non-breaking fallback message.

Near-term frontend improvements:

- Remove duplicated inline fallback data after Supabase and seed fallback are reliable.
- Render sources from `data.sources` instead of hardcoded HTML.
- Add a visible archive area for past weekly issues.
- Add draft/review/admin surface only after auth is chosen.

### Supabase

Current schema file: `supabase/schema.sql`

Tables:

- `cities`
- `places`
- `day_trips`
- `weekly_issues`
- `sources`
- `source_candidates`

Status enum:

- `draft`
- `review`
- `published`
- `archived`

Immediate Supabase tasks:

1. Apply `supabase/schema.sql` to the target Supabase project.
2. Set Vercel env vars.
3. Run:

```bash
npm run sync:supabase
```

4. Verify:

```bash
curl https://florida-guide-zeta.vercel.app/api/city-pulse?city=nature-coast
```

Expected result:

- No `liveError`
- 26 places
- 3 day trips
- 18 sources
- published pilot issue

### EmailOctopus

Current endpoint: `api/subscribe.js`

Behavior:

- Accepts `POST`.
- Validates email.
- Sends contact to EmailOctopus list.
- Tags contacts:
  - `nature-coast-pulse`
  - `site-signup`
- Treats duplicate email as success.
- Returns `503` if EmailOctopus keys are missing.

Important limitation:

EmailOctopus supports list/contact API work, but campaign sending is dashboard/product-side. The app should generate or archive newsletter content; EmailOctopus should own the actual campaign send unless a later provider/API path is chosen.

Next EmailOctopus tasks:

1. Create/select the Nature Coast Pulse list.
2. Add `EMAILOCTOPUS_API_KEY` and `EMAILOCTOPUS_LIST_ID` in Vercel.
3. Test signup on production with a real inbox.
4. Confirm double opt-in behavior.
5. Add UTM/source fields only if the fields already exist in EmailOctopus; do not blindly send custom fields.

### Scheduled Work

Current Vercel cron config: `vercel.json`

Current cron:

```json
{
  "path": "/api/cron/weekly-draft",
  "schedule": "0 13 * * 1"
}
```

This runs Monday at 13:00 UTC.

Current cron behavior:

- Loads published Nature Coast places.
- Picks a weekly spotlight candidate.
- Picks day trip candidates.
- Creates a `draft` weekly issue.
- Creates `draft` day trip candidates.
- Does not publish.

Next scheduled-work tasks:

- Add source sweep ingestion before issue drafting.
- Store source discoveries in `source_candidates`.
- Rank candidates by usefulness, freshness, weather fit, source quality, and local relevance.
- Mark old stale candidates as archived or review-needed.
- Keep publication draft-first.

## Source List

The seed currently includes 18 sources:

- Discover Crystal River
- City of Crystal River calendar
- Citrus County Chamber community calendar
- Crystal River National Wildlife Refuge
- Three Sisters Springs
- FWC boating and scallop rules
- Ellie Schiller Homosassa Springs Wildlife State Park
- Crystal River Preserve State Park
- Rainbow Springs State Park
- Silver Springs State Park
- Ocala / Marion County community calendar
- City of Ocala event calendar
- Marion County calendar
- Visit Gainesville events
- Visit Gainesville What's Good
- Cedar Key Chamber calendar
- Levy County events calendar
- Levy County Visitors Bureau

Source policy:

- Prefer official calendars, tourism boards, chambers, parks, city/county pages, and direct venue/business pages.
- Social posts are leads, not facts.
- Every event/day-trip recommendation should have a source URL and a last-checked timestamp once the sweep exists.
- If a source conflicts with another source, prefer official venue/city/park pages over aggregator pages.

## Implementation Phases

### Phase 1: Wire Live Data

Goal: production site reads real Supabase data and captures real EmailOctopus signups.

Tasks:

- Apply Supabase schema.
- Run `npm run sync:supabase`.
- Set Vercel env vars.
- Verify `/api/city-pulse` returns live Supabase rows.
- Verify `/api/subscribe` adds a real EmailOctopus contact.
- Confirm the page still renders if Supabase fails.

Acceptance:

- Production site renders from Supabase.
- Signup lands in EmailOctopus.
- No console-breaking frontend errors.
- Seed fallback still works.

### Phase 2: Source Sweep

Goal: build the weekly intake system.

Tasks:

- Create `scripts/sweep-sources.mjs` or a serverless equivalent.
- Fetch configured source URLs.
- Extract candidate items:
  - title
  - URL
  - source
  - location
  - start/end date when present
  - summary
  - raw payload/excerpt
- Insert into `source_candidates` with `draft` status.
- Deduplicate by normalized title, URL, date, and source.
- Add `last_checked_at` updates to `sources`.

Acceptance:

- Running source sweep creates reviewable candidates.
- Failed sources do not kill the whole sweep.
- Each candidate has enough source context to verify manually.

### Phase 3: Weekly Draft Builder

Goal: turn source candidates and places into a weekly draft issue.

Tasks:

- Update `api/cron/weekly-draft.js` to use source candidates.
- Choose:
  - one place spotlight
  - five weekly picks
  - one day trip
  - one meet-people/social opportunity
  - one moving-here note
- Include source URLs in draft metadata.
- Avoid repeated picks from recent issues.
- Keep generated issue status as `draft`.

Acceptance:

- Weekly issue drafts are coherent and source-backed.
- Day trips refresh weekly.
- No generated item is published automatically.

### Phase 4: Review and Publish

Goal: approved content becomes the public issue/archive.

Possible approaches:

- Minimal first: Supabase table edits in the Supabase dashboard.
- Better: small protected admin page.

Tasks:

- Add `review` state for candidates that need human attention.
- Add publish action that flips issue/items to `published`.
- Archive old issues.
- Render issue archive on the public page.

Acceptance:

- Reviewer can approve/reject/edit without touching code.
- Public site only shows `published` content.

### Phase 5: Newsletter Workflow

Goal: EmailOctopus campaign content comes from the approved weekly issue.

Tasks:

- Add script to generate EmailOctopus-ready campaign copy from the latest published issue.
- Include:
  - subject
  - preview text
  - intro
  - weekly picks
  - day trip
  - sponsor slot
  - links back to the site/archive
- Store generated campaign HTML/Markdown in `data/newsletter-drafts/` or Supabase.
- Decide whether campaign creation stays manual in EmailOctopus or if a later API/provider supports campaign creation.

Acceptance:

- Published weekly issue can become a newsletter without rewriting it by hand.
- Site archive and email issue match.

### Phase 6: City Pulse Reuse

Goal: make Nature Coast the first repeatable city, not a one-off.

Tasks:

- Keep `city.slug` as the routing key.
- Move city-specific seed/source data into per-city files.
- Generalize source sweep by city.
- Generalize issue generation by city.
- Add city config:
  - display name
  - region
  - timezone
  - lanes/neighborhoods
  - categories
  - weather zones
  - source list
  - brand assets

Acceptance:

- Adding another city does not require cloning the whole app.
- Nature Coast remains the working reference implementation.

## Verification Commands

Run before claiming success:

```bash
npm run check:data
npm audit --audit-level=moderate
```

API smoke:

```bash
node - <<'NODE'
import handler from './api/city-pulse.js';
const chunks = [];
const res = {
  statusCode: 200,
  headers: {},
  setHeader(k, v) { this.headers[k] = v; },
  status(code) { this.statusCode = code; return this; },
  json(payload) { chunks.push(payload); return this; }
};
await handler({ query: { city: 'nature-coast' } }, res);
if (res.statusCode !== 200) throw new Error(`status ${res.statusCode}`);
if (!chunks[0]?.places?.length) throw new Error('missing places');
console.log(`API OK: ${chunks[0].places.length} places`);
NODE
```

Signup smoke:

```bash
node - <<'NODE'
import handler from './api/subscribe.js';
const res = {
  headers: {},
  statusCode: 200,
  setHeader(k, v) { this.headers[k] = v; },
  status(code) { this.statusCode = code; return this; },
  json(payload) { console.log(this.statusCode, payload); return this; }
};
await handler({ method: 'POST', body: { email: 'test@example.com' } }, res);
NODE
```

Browser smoke:

```bash
python3 -m http.server 4173
google-chrome --headless --disable-gpu --no-sandbox --virtual-time-budget=8000 --dump-dom http://127.0.0.1:4173/ | rg "Get the weekly Nature Coast Pulse|26 of 26 places shown|Crystal River / Kings Bay"
```

Stop the server after the test:

```bash
lsof -ti :4173 | xargs -r kill
```

## Open Decisions

- Should the admin/review UI use Supabase auth, Vercel protection, or stay dashboard-only for the first live pass?
- What exact day/time should weekly source sweep and draft creation run in Eastern time?
- Should EmailOctopus contacts use double opt-in or direct subscribe?
- Do we want a sponsor table now, or keep sponsor copy manual until there is real audience data?
- Should images remain remote Wikimedia/official URLs, or should the app cache/own image assets later?

## Do Not Do Yet

- Do not auto-publish AI-generated picks.
- Do not build a huge multi-city framework before Nature Coast works.
- Do not send custom EmailOctopus fields unless the fields already exist.
- Do not make social posts authoritative sources.
- Do not hard-delete historical issues/candidates; archive instead.

## Next Best Codex Task

Start with Phase 1.

Exact prompt:

```text
In /home/robot/.openclaw/workspace/projects/florida-nature-coast-guide, follow docs/live-system-plan.md Phase 1. Apply the Supabase schema if credentials are available, sync seed data, set/verify Vercel env vars if possible, and prove production /api/city-pulse and /api/subscribe work end to end. If credentials are missing, stop with the exact missing vars and the commands to run.
```
