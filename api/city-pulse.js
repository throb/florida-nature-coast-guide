import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import path from "node:path";

const seedPath = path.join(process.cwd(), "data", "nature-coast.seed.json");

async function loadSeed() {
  return JSON.parse(await fs.readFile(seedPath, "utf8"));
}

function supabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function loadPublishedFromSupabase(citySlug) {
  const supabase = supabaseClient();
  if (!supabase) return null;

  const { data: city, error: cityError } = await supabase
    .from("cities")
    .select("*")
    .eq("slug", citySlug)
    .single();
  if (cityError) throw cityError;

  const [
    { data: places, error: placesError },
    { data: trips, error: tripsError },
    { data: issue, error: issueError },
    { data: sources, error: sourcesError },
    { data: settings, error: settingsError },
    { data: settingsFallback, error: settingsFallbackError }
  ] = await Promise.all([
    supabase.from("places").select("*").eq("city_id", city.id).eq("status", "published").order("sort_order"),
    supabase.from("day_trips").select("*").eq("city_id", city.id).eq("status", "published").order("sort_order"),
    supabase.from("weekly_issues").select("*").eq("city_id", city.id).eq("status", "published").order("publish_date", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("sources").select("*").eq("city_id", city.id).eq("active", true).order("name"),
    supabase.from("city_settings").select("key,value").eq("city_id", city.id),
    supabase.from("source_candidates").select("title,raw,created_at").eq("city_id", city.id).order("created_at", { ascending: false })
  ]);

  if (placesError) throw placesError;
  if (tripsError) throw tripsError;
  if (issueError) throw issueError;
  if (sourcesError) throw sourcesError;
  if (settingsError && settingsError.code !== "PGRST205" && settingsError.code !== "42P01") throw settingsError;
  if (settingsFallbackError) throw settingsFallbackError;

  const seed = await loadSeed();
  const settingsByKey = settingsError ? {} : Object.fromEntries((settings || []).map(setting => [setting.key, setting.value]));
  for (const row of (settingsFallback || []).filter(row => row.title?.startsWith("__setting:"))) {
    const key = row.title.replace("__setting:", "");
    if (!(key in settingsByKey) && row.raw && "value" in row.raw) {
      settingsByKey[key] = row.raw.value;
    }
  }
  return {
    ...seed,
    weatherLocations: settingsByKey.weatherLocations || seed.weatherLocations,
    categoryLabels: settingsByKey.categoryLabels || seed.categoryLabels,
    categoryImages: settingsByKey.categoryImages || seed.categoryImages,
    updateScope: settingsByKey.updateScope || seed.updateScope,
    operatingCadence: settingsByKey.operatingCadence || seed.operatingCadence,
    city: {
      slug: city.slug,
      name: city.name,
      region: city.region,
      lanes: city.lanes || seed.city.lanes,
      timezone: city.timezone || seed.city.timezone
    },
    issue: issue ? {
      slug: issue.slug,
      status: issue.status,
      label: issue.label,
      kicker: issue.kicker,
      title: issue.title,
      subject: issue.subject,
      summary: issue.summary,
      picks: issue.picks || [],
      cards: issue.cards || []
    } : seed.issue,
    places: (places || []).map(place => ({
      id: place.slug,
      sortOrder: place.sort_order,
      status: place.status,
      name: place.name,
      area: place.area,
      category: place.category,
      tags: place.tags || [],
      rating: place.rating,
      blurb: place.blurb,
      map: place.map_url,
      web: place.web_url,
      image: place.image_url
    })),
    dayTrips: (trips || []).map(trip => ({
      id: trip.slug,
      sortOrder: trip.sort_order,
      status: trip.status,
      kicker: trip.kicker,
      title: trip.title,
      body: trip.body,
      tags: trip.tags || []
    })),
    sources: (sources || []).map(source => ({
      name: source.name,
      url: source.url,
      lane: source.lane,
      note: source.note
    }))
  };
}

export default async function handler(req, res) {
  const citySlug = req.query.city || "nature-coast";
  try {
    const payload = await loadPublishedFromSupabase(citySlug) || await loadSeed();
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=3600");
    res.status(200).json(payload);
  } catch (error) {
    console.error(error);
    const seed = await loadSeed();
    res.setHeader("Cache-Control", "s-maxage=60");
    res.status(200).json({ ...seed, liveError: error.message });
  }
}
