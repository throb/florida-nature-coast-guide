# OpenClaw Publish API

This API lets a remote OpenClaw process publish structured Nature Coast Insider data into the Vercel-hosted app.

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

The Eats page reads `settings.guidePages.eats` from that public payload after rendering its bundled fallback data. Use this setting when OpenClaw needs to update Eats cards by API without editing `guide-data.js`.

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

## Advertiser Copy Rules

OpenClaw must not use `founder`, `founding`, `founding sponsor`, or `founder rate` in advertiser, sponsor, or partner copy.

Use community-oriented language instead:

- `community partner`
- `community partnership`
- `community partner slot`
- `local guide partner`

Advertisers should be positioned as part of the community-building team that helps keep the guide useful, source-backed, and connected to real local businesses. Keep paid placement labeling clear and honest.

## Full Payload Shape

```json
{
  "city": "nature-coast",
  "dryRun": false,
  "publish": {
    "city": {
      "slug": "nature-coast",
      "name": "Nature Coast Insider",
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
        "uvIndex": {
          "value": 10,
          "category": "Very high",
          "window": "11a-4p",
          "note": "Use shade, water, sunscreen, and a long-sleeve sun shirt for open-water plans."
        },
        "updatedAt": "2026-06-06T12:00:00-04:00"
      },
      "guidePages": {
        "eats": {
          "mealStops": [
            {
              "slot": "Dinner",
              "title": "Peck's Old Port Cove",
              "area": "Ozello",
              "dek": "Old-school seafood after the Ozello drive.",
              "websiteUrl": "https://pecksoldportcove.com/",
              "mapQuery": "Peck's Old Port Cove Crystal River FL",
              "googlePlaceId": "EXACT_GOOGLE_PLACE_ID_HERE",
              "placePhotoQuery": "Peck's Old Port Cove Crystal River FL",
              "imageLabel": "Peck's Old Port Cove",
              "photoStatus": "PASS exact place photo",
              "photoEvidence": "Returned Google place identity and rendered card were checked."
            }
          ],
          "eats": [],
          "foodPlans": []
        }
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
    "sourceCandidates": [
      {
        "title": "Small Town Saturday Night in Downtown Inverness",
        "status": "review",
        "url": "https://www.inverness-fl.gov/Calendar.aspx?EID=7081&calType=0&day=5&month=6&year=2026",
        "startsAt": "2026-06-13T17:00:00-04:00",
        "endsAt": "2026-06-13T21:00:00-04:00",
        "location": "Downtown Inverness, 207 Courthouse Square, Inverness, FL 34450",
        "summary": "Exact, source-backed event summary.",
        "raw": {
          "kind": "event",
          "source": "City of Inverness calendar",
          "sourceUrl": "https://www.inverness-fl.gov/Calendar.aspx?EID=7081&calType=0&day=5&month=6&year=2026",
          "backupUrl": "https://inverness.gov/679/Small-Town-Saturday-Night",
          "linkQuality": "exact",
          "checkedAt": "2026-06-06T16:00:00Z"
        }
      }
    ]
  }
}
```

## Source Candidate Link Quality

Review/published source candidates must use exact detail URLs. The publish API rejects review/published candidates whose `url` is only a generic event index, calendar root, or search results page.

Classify every candidate before publishing:

- `event`: community calendar item, festival, class, market, music, meetup, or other thing a person can attend.
- `alert`: advisory or warning.
- `rule`: regulation, season, permit, or official rule.
- `access-note`: closure, shuttle/parking/route/access change, park operations note.
- `weather`: weather or water condition.
- `place` / `business`: guide/place/business discovery item.

Only `event` candidates belong in Community Events. Alerts, rules, access notes, weather, and season/regulation items should be published to conditions/planning-note surfaces instead.

Bad clickable URLs for review/published candidates include:

- `https://www.discovercrystalriverfl.com/events/`
- `https://business.citruscountychamber.com/eventcalendar/Search`
- generic `/calendar`, `/Calendar.aspx`, or `/events` pages without event identifiers

OpenClaw should search by event title, venue, city, and date until it finds the direct detail page. Prefer official city, venue, chamber detail, tourism detail, or event-owned sites. If the official site is useful but another exact detail page has clearer facts, use the official site as `url` and store the other page in `raw.backupUrl`.

Review-ready candidates should include:

- `url`: exact event/detail page
- `startsAt` and `endsAt` when available
- `location`: venue and address when available
- `summary`: practical facts from the detail page
- `raw.source`, `raw.sourceUrl`, `raw.linkQuality: "exact"`, and `raw.checkedAt`

If exact research fails, keep the candidate as `draft`, set `raw.linkQuality` to `needs-detail`, and do not treat it as daily-panel content.

## Place And Business Link Quality

For places and businesses, the public URL should be the canonical user destination, not simply the source where OpenClaw discovered the listing.

Use:

- `web` for the business-owned website, official attraction page, menu/order page, reservation/booking page, ticket page, or official social profile when no website exists.
- `sourceUrl` for tourism, chamber, directory, map, city, or other evidence pages that verify facts.
- `map` for the map/directions URL.
- `websiteUrl` for Eats-page cards when the public action should say Website.
- `mapUrl` or `mapQuery` for Eats-page MAP buttons. Use `mapUrl` when a stable Google Maps URL is known; otherwise provide a precise `mapQuery` like `Peck's Old Port Cove Crystal River FL`.
- `googlePlaceId` or `placeId` for exact Eats-page Google place photos. This is preferred because it avoids bad free-text Places matches.
- `placePhotoQuery` for Eats-page place photo discovery only when the exact Place ID is not yet known. The public page sends this to `/api/place-photo`, which uses the server-side Google Maps API key and falls back to `image` if Google is unavailable.

Do not use a tourism/chamber/directory page as `web` when that page links to a live, useful official business site.

Do not put Google Maps API keys or raw Places photo calls in public HTML. Place photos must go through `/api/place-photo` or through a daily OpenClaw publish step that stores a safe public image URL.

Place photo success is not proven by DOM `src` values, HTTP 200s, attribution counts, or the string `/api/place-photo` appearing on cards. OpenClaw must verify identity:

- Prefer exact `googlePlaceId` / `placeId`.
- In JSON mode, confirm the returned `place.name`, `place.address`, or `place.googleMapsUri` is the intended business/place.
- Browser-render the Eats page and visually reject generic regional scenery, repeated fallback images, tourism filler, unrelated streets/water/trees, or another business.
- Record per-place evidence as `PASS exact place photo`, `PASS reviewed fallback`, or `BLOCKED needs human image`.
- If the exact Place ID still returns a poor first photo, publish a reviewed image from a business-owned site/social/source when allowed, or leave the item marked for human image review. Do not claim the photo work is fixed.

Do not download, rehost, strip attribution from, or launder Google Places/Maps photos or copyrighted business/social photos into site storage. Google Places is useful for identity and live attributed display; it is not the permanent asset library. Durable `image` fields should be app-owned or rights-cleared: advertiser/business-provided media, user-submitted photos with permission, generated images, public-domain/compatible-license assets, or paid/licensed stock.

For approved non-Google image URLs, OpenClaw can import the file into Supabase Storage:

```bash
npm run import:image -- --url "https://example.com/approved-photo.jpg" --id "pecks-old-port-cove" --label "Peck's Old Port Cove" --credit "Provided by Peck's Old Port Cove"
```

The command returns a stable public storage URL. Publish that returned URL as the Eats card `image` inside `settings.guidePages.eats`, keep the source/credit/evidence fields, then browser-verify the card.

Example:

```json
{
  "id": "peck-s-old-port-cove",
  "status": "published",
  "sortOrder": 10,
  "name": "Peck's Old Port Cove",
  "area": "Ozello",
  "category": "food",
  "tags": ["Seafood", "Waterfront", "Old-school"],
  "rating": "4.5 / 4,267",
  "blurb": "Go for the drive, seafood, and old-school waterfront feel.",
  "map": "https://maps.google.com/?cid=7457366538817134625",
  "web": "https://pecksoldportcove.com/",
  "websiteUrl": "https://pecksoldportcove.com/",
  "mapQuery": "Peck's Old Port Cove Crystal River FL",
  "googlePlaceId": "EXACT_GOOGLE_PLACE_ID_HERE",
  "placePhotoQuery": "Peck's Old Port Cove Crystal River FL",
  "photoStatus": "PASS exact place photo",
  "photoVerifiedAt": "2026-06-06T16:00:00Z",
  "sourceUrl": "https://www.discovercrystalriverfl.com/directory/pecks-old-port-cove/"
}
```

For the server-side Google photo path, configure one of:

- `GOOGLE_MAPS_API_KEY`
- `GOOGLE_PLACES_API_KEY`

The endpoint accepts either an exact `placeId` / `googlePlaceId` or a fallback `placePhotoQuery`. Exact Place IDs are preferred.

```text
GET /api/place-photo?format=json&placeId=<google-place-id>
GET /api/place-photo?format=json&query=Peck%27s%20Old%20Port%20Cove%20Crystal%20River%20FL
```

The endpoint can either redirect to the Google-hosted photo URI or return JSON with `photoUri`, `attributions`, and the returned `place` identity fields.

The Eats page uses the JSON mode so it can display required Google photo attributions when they exist. If the key is missing, the Places API fails, or no photo is found, the endpoint returns the card's fallback `image`.

Example JSON response:

```json
{
  "photoUri": "https://lh3.googleusercontent.com/places/...",
  "fallback": false,
  "place": {
    "id": "ChIJ...",
    "name": "Peck's Old Port Cove",
    "address": "139 N Ozello Trail, Crystal River, FL 34429, USA",
    "googleMapsUri": "https://maps.google.com/?cid=..."
  },
  "attributions": []
}
```

## Image Publishing

OpenClaw can publish images in two ways:

- Assign an existing public remote URL.
- Upload generated image bytes as base64 to Supabase Storage.

Every image can optionally include a `target`. If no target is provided, the API resolves or stores the image and returns the public URL without changing page content.

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

### Assign The This Week Hero

Use this for the daily 3am OpenClaw update. The page reads `settings.homepage.image` from `/api/city-pulse` and uses the local daily image pool only when no published homepage image exists.

Remote image URLs should be direct, stable, public image URLs. If the image is generated by OpenClaw, send `dataBase64` instead of `url`; the API uploads it to Supabase Storage and then writes the stored public URL into `settings.homepage.image`.

```json
{
  "city": "nature-coast",
  "publish": {
    "images": [
      {
        "id": "daily-this-week-hero",
        "url": "https://example.com/daily-this-week-hero.jpg",
        "target": {
          "type": "setting",
          "key": "homepage",
          "value": {
            "imageLabel": "Crystal River morning",
            "imageCredit": "OpenClaw daily image sweep",
            "updatedAt": "2026-06-06T09:00:00-04:00"
          }
        }
      }
    ]
  }
}
```

Generated-image version:

```json
{
  "city": "nature-coast",
  "publish": {
    "images": [
      {
        "id": "daily-this-week-hero",
        "filename": "daily-this-week-hero.png",
        "contentType": "image/png",
        "dataBase64": "<base64 image bytes>",
        "target": {
          "type": "setting",
          "key": "homepage",
          "value": {
            "imageLabel": "Generated Florida Nature Coast sunrise",
            "imageCredit": "Generated by OpenClaw daily image workflow",
            "updatedAt": "2026-06-06T03:00:00-04:00"
          }
        }
      }
    ]
  }
}
```

After publishing, OpenClaw should verify:

```text
GET /api/city-pulse?city=nature-coast
```

Expected readback shape:

```json
{
  "homepage": {
    "image": "https://...",
    "imageLabel": "Crystal River morning",
    "imageCredit": "OpenClaw daily image sweep",
    "updatedAt": "2026-06-06T03:00:00-04:00"
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
