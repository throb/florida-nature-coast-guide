# OpenClaw Publish API

This API lets a remote OpenClaw process publish structured Nature Coast Pulse data into the Vercel-hosted app.

OpenClaw does not need to run on the same machine as Vercel. It only needs HTTPS access to the deployed site and the shared publish secret.

## Endpoint

```text
POST https://<your-vercel-domain>/api/publish
```

Local testing:

```text
POST http://127.0.0.1:3000/api/publish
```

## Authentication

Set this env var in Vercel and in local `.env` for testing:

```bash
PUBLISH_API_KEY=<long-random-secret>
```

OpenClaw should send it as a bearer token:

```http
Authorization: Bearer <PUBLISH_API_KEY>
Content-Type: application/json
```

`X-OpenClaw-Key` and `X-Publish-Key` are also accepted for clients that cannot set `Authorization`.

## What It Can Publish

The endpoint upserts canonical Supabase rows for:

- `city`
- `places`
- `dayTrips`
- `issue`
- `sources`
- `sourceCandidates`
- `images`
- `settings`

`settings` is for structured page/config data that does not fit a first-class table yet:

- `weatherLocations`
- `categoryLabels`
- `categoryImages`
- `updateScope`
- `operatingCadence`
- `weatherSnapshot`
- `homepage`
- `guidePages`

Published data is read back through:

```text
GET /api/city-pulse?city=nature-coast
```

## Minimal Example

```bash
curl -X POST "https://<your-vercel-domain>/api/publish" \
  -H "Authorization: Bearer $PUBLISH_API_KEY" \
  -H "Content-Type: application/json" \
  --data '{
    "city": "nature-coast",
    "publish": {
      "places": [
        {
          "id": "three-sisters-springs",
          "status": "published",
          "sortOrder": 1,
          "name": "Three Sisters Springs",
          "area": "Crystal River",
          "category": "water",
          "tags": ["Springs", "Manatees"],
          "rating": "Official refuge",
          "blurb": "Clear spring water and core Crystal River context.",
          "map": "https://maps.google.com/?cid=303543040931506697",
          "image": "https://example.com/three-sisters.jpg",
          "sourceUrl": "https://www.crystalriverfl.org/threesisterssprings"
        }
      ]
    }
  }'
```

Response:

```json
{
  "ok": true,
  "city": "nature-coast",
  "counts": {
    "places": 1,
    "dayTrips": 0,
    "sources": 0,
    "sourceCandidates": 0,
    "images": 0,
    "settings": 0,
    "issue": 0
  },
  "storage": {
    "settings": {},
    "images": []
  }
}
```

For settings writes, `storage.settings` reports where each setting was saved. Expected values:

- `city_settings` when the first-class table is visible through Supabase REST.
- `source_candidates` as a durable fallback when Supabase REST has not picked up `city_settings` yet.

Both storage paths are read by `/api/city-pulse`, so OpenClaw can still update site-facing settings such as image URLs and weather config.

## Full Payload Shape

```json
{
  "city": "nature-coast",
  "dryRun": false,
  "publish": {
    "city": {
      "slug": "nature-coast",
      "name": "Nature Coast Pulse",
      "region": "Florida Nature Coast",
      "timezone": "America/New_York",
      "lanes": ["Crystal River", "Homosassa", "Ocala", "Gainesville"]
    },
    "settings": {
      "weatherLocations": [
        { "name": "Crystal River", "query": "Crystal River,FL", "use": "Springs / Kings Bay" }
      ],
      "categoryImages": {
        "water": "https://example.com/water.jpg"
      },
      "weatherSnapshot": {
        "label": "Today · Crystal River",
        "summary": "Hot, PM storms likely",
        "updatedAt": "2026-06-06T12:00:00-04:00"
      }
    },
    "issue": {
      "slug": "nature-coast-2026-06-06",
      "status": "published",
      "label": "Issue 002 · June 1-7, 2026",
      "kicker": "This week",
      "title": "This week in the Nature Coast",
      "subject": "Clear springs, food stops, and a smarter weekend loop",
      "summary": "A weekly issue summary.",
      "picks": ["First pick", "Second pick"],
      "cards": [
        { "kicker": "Place of the week", "title": "Three Sisters Springs", "body": "Go early." }
      ],
      "publishDate": "2026-06-06"
    },
    "places": [],
    "dayTrips": [],
    "images": [],
    "sources": [],
    "sourceCandidates": []
  }
}
```

## Image Publishing

OpenClaw can publish images in two ways:

- Assign an existing public remote URL.
- Upload generated image bytes as base64 to Supabase Storage.

Set this optional env var in Vercel:

```bash
PUBLISH_IMAGE_BUCKET=nature-coast-pulse
```

If the bucket does not exist, the API attempts to create a public bucket with that name.

### Assign Remote Image To A Place

```json
{
  "city": "nature-coast",
  "publish": {
    "images": [
      {
        "id": "three-sisters-current",
        "url": "https://example.com/three-sisters-current.jpg",
        "target": {
          "type": "place",
          "id": "three-sisters-springs"
        }
      }
    ]
  }
}
```

### Upload Generated Image And Assign To A Place

```json
{
  "city": "nature-coast",
  "publish": {
    "images": [
      {
        "id": "three-sisters-generated-hero",
        "filename": "three-sisters-generated-hero.png",
        "contentType": "image/png",
        "dataBase64": "<base64 image bytes>",
        "target": {
          "type": "place",
          "id": "three-sisters-springs"
        }
      }
    ]
  }
}
```

### Assign Category Image

```json
{
  "city": "nature-coast",
  "publish": {
    "images": [
      {
        "id": "water-category",
        "url": "https://example.com/water-category.jpg",
        "target": {
          "type": "categoryImage",
          "category": "water"
        }
      }
    ]
  }
}
```

Image target types:

- `place`: updates `places.image_url` by place slug/id.
- `categoryImage`: merges the URL into `settings.categoryImages[category]`.
- `setting`: writes `{ "image": "<url>", ...target.value }` to an allowed settings key.

Image response example:

```json
{
  "storage": {
    "images": [
      {
        "id": "three-sisters-generated-hero",
        "url": "https://<project>.supabase.co/storage/v1/object/public/nature-coast-pulse/nature-coast/three-sisters-generated-hero/three-sisters-generated-hero.png",
        "storage": "supabase_storage:nature-coast-pulse",
        "path": "nature-coast/three-sisters-generated-hero/three-sisters-generated-hero.png",
        "target": "place:three-sisters-springs"
      }
    ]
  }
}
```

## Dry Run

Use `dryRun: true` to validate auth and count the payload without writing to Supabase:

```bash
curl -X POST "https://<your-vercel-domain>/api/publish" \
  -H "Authorization: Bearer $PUBLISH_API_KEY" \
  -H "Content-Type: application/json" \
  --data '{"city":"nature-coast","dryRun":true,"publish":{"places":[]}}'
```

## Status Values

Allowed content statuses:

```text
draft
review
published
archived
```

Public `/api/city-pulse` only returns `published` places, day trips, and the latest `published` issue.

## Database Setup

Before publishing `settings`, apply the latest `supabase/schema.sql` in Supabase. The new table is:

```sql
create table if not exists city_settings (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities(id) on delete cascade,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(city_id, key)
);
```

Also ensure `service_role` has `select, insert, update, delete` on `city_settings`.

After applying SQL in Supabase, the REST schema cache can take a moment to notice new tables. Until then, settings are automatically stored as fallback rows in `source_candidates` with titles like `__setting:weatherLocations`. `/api/city-pulse` reads that fallback, so remote OpenClaw publishes still affect the site.

## Remote OpenClaw Notes

- OpenClaw should call the public Vercel HTTPS URL, not `localhost`.
- Keep `PUBLISH_API_KEY` out of GitHub and prompts that may be logged.
- Prefer idempotent upserts with stable `id`/`slug` values.
- Send only changed rows when possible; the endpoint does not require a full-site payload.
- Use `status: "draft"` for AI-generated content that still needs review.
- Use `status: "published"` only for content approved to appear publicly.
- Found images can be published as remote URLs.
- Generated images can be sent as `images[].dataBase64`; the API stores them in Supabase Storage and publishes the resulting public URL.
