import { createClient } from "@supabase/supabase-js";

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function weekStart(date) {
  const current = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = current.getUTCDay() || 7;
  current.setUTCDate(current.getUTCDate() - day + 1);
  return current.toISOString().slice(0, 10);
}

function supabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export default async function handler(req, res) {
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = supabaseClient();
  if (!supabase) {
    return res.status(503).json({ error: "Supabase env vars are not configured." });
  }

  const citySlug = req.query.city || "nature-coast";
  const publishWeek = weekStart(new Date());
  const issueSlug = `${citySlug}-${publishWeek}`;

  const { data: city, error: cityError } = await supabase
    .from("cities")
    .select("id, name")
    .eq("slug", citySlug)
    .single();
  if (cityError) return res.status(500).json({ error: cityError.message });

  const { data: places, error: placesError } = await supabase
    .from("places")
    .select("*")
    .eq("city_id", city.id)
    .eq("status", "published")
    .in("category", ["water", "night", "trip", "people"])
    .order("sort_order");
  if (placesError) return res.status(500).json({ error: placesError.message });
  if (!places?.length) return res.status(409).json({ error: "No published places available for draft generation." });

  const seed = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
  const spotlight = places[seed % places.length];
  const tripPool = places.filter(place => place.category === "trip");
  const dayTripPicks = [0, 1, 2].map(offset => tripPool[(seed + offset) % tripPool.length]).filter(Boolean);

  const issue = {
    city_id: city.id,
    slug: issueSlug,
    status: "draft",
    label: `Weekly draft / ${publishWeek}`,
    kicker: "Draft issue",
    title: `${city.name} draft for ${publishWeek}`,
    subject: `${spotlight.name} and a smarter Nature Coast week`,
    summary: "Auto-generated weekly draft. Verify sources, hours, weather fit, and sponsor placement before publishing.",
    picks: [
      `Spotlight candidate: ${spotlight.name} in ${spotlight.area}.`,
      ...dayTripPicks.map(place => `Day trip candidate: ${place.name} in ${place.area}.`)
    ],
    cards: [
      {
        kicker: "Needs review",
        title: spotlight.name,
        body: spotlight.blurb
      },
      ...dayTripPicks.slice(0, 3).map(place => ({
        kicker: "Day trip candidate",
        title: place.name,
        body: place.blurb
      }))
    ],
    publish_date: publishWeek
  };

  const { error: issueError } = await supabase
    .from("weekly_issues")
    .upsert(issue, { onConflict: "city_id,slug" });
  if (issueError) return res.status(500).json({ error: issueError.message });

  for (const [index, place] of dayTripPicks.entries()) {
    const { error: tripError } = await supabase.from("day_trips").upsert({
      city_id: city.id,
      slug: `${issueSlug}-${slugify(place.name)}`,
      status: "draft",
      sort_order: index + 1,
      kicker: "Weekly candidate",
      title: place.name,
      body: place.blurb,
      tags: place.tags,
      publish_week: publishWeek,
      source_notes: [{ place_id: place.id, generated_from: "published_places" }]
    }, { onConflict: "city_id,slug" });
    if (tripError) return res.status(500).json({ error: tripError.message });
  }

  return res.status(200).json({
    ok: true,
    city: citySlug,
    status: "draft",
    publishWeek,
    issue: issueSlug,
    spotlight: spotlight.name,
    dayTrips: dayTripPicks.map(place => place.name)
  });
}
