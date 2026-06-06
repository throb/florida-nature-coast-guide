import fs from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  throw new Error("Set SUPABASE_URL plus SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY before syncing.");
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const data = JSON.parse(await fs.readFile("data/nature-coast.seed.json", "utf8"));

async function upsertOne(table, row, conflict = "slug") {
  const { data: result, error } = await supabase
    .from(table)
    .upsert(row, { onConflict: conflict })
    .select()
    .single();
  if (error) throw error;
  return result;
}

const city = await upsertOne("cities", {
  slug: data.city.slug,
  name: data.city.name,
  region: data.city.region,
  timezone: data.city.timezone,
  lanes: data.city.lanes
});

for (const place of data.places) {
  await upsertOne("places", {
    city_id: city.id,
    slug: place.id,
    status: place.status,
    sort_order: place.sortOrder,
    name: place.name,
    area: place.area,
    category: place.category,
    tags: place.tags,
    rating: place.rating,
    blurb: place.blurb,
    map_url: place.map,
    web_url: place.web || null,
    image_url: place.image || null
  }, "city_id,slug");
}

for (const [index, trip] of data.dayTrips.entries()) {
  await upsertOne("day_trips", {
    city_id: city.id,
    slug: trip.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    status: trip.status,
    sort_order: index + 1,
    kicker: trip.kicker,
    title: trip.title,
    body: trip.body,
    tags: trip.tags
  }, "city_id,slug");
}

for (const source of data.sources) {
  await upsertOne("sources", {
    city_id: city.id,
    name: source.name,
    url: source.url,
    lane: source.lane,
    note: source.note,
    active: true
  }, "city_id,url");
}

await upsertOne("weekly_issues", {
  city_id: city.id,
  slug: data.issue.slug,
  status: data.issue.status,
  label: data.issue.label,
  kicker: data.issue.kicker,
  title: data.issue.title,
  subject: data.issue.subject,
  summary: data.issue.summary,
  picks: data.issue.picks,
  cards: data.issue.cards
}, "city_id,slug");

console.log(`Synced ${data.city.name}: ${data.places.length} places, ${data.dayTrips.length} day trips, ${data.sources.length} sources.`);
