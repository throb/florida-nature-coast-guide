import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import path from "node:path";

const STATUS_VALUES = new Set(["draft", "review", "published", "archived"]);
const seedPath = path.join(process.cwd(), "data", "nature-coast.seed.json");
const SETTING_KEYS = new Set([
  "weatherLocations",
  "categoryLabels",
  "categoryImages",
  "updateScope",
  "operatingCadence",
  "weatherSnapshot",
  "homepage",
  "guidePages"
]);

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-OpenClaw-Key, X-Publish-Key");
}

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body;
}

function isAuthed(req) {
  const expected = process.env.PUBLISH_API_KEY || process.env.OPENCLAW_PUBLISH_KEY;
  if (!expected) return false;
  const auth = req.headers.authorization || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const headerKey = req.headers["x-openclaw-key"] || req.headers["x-publish-key"];
  return bearer === expected || headerKey === expected;
}

function supabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function asArray(value, name) {
  if (value == null) return [];
  if (!Array.isArray(value)) throw new Error(`${name} must be an array.`);
  return value;
}

function asObject(value, name) {
  if (value == null) return {};
  if (typeof value !== "object" || Array.isArray(value)) throw new Error(`${name} must be an object.`);
  return value;
}

function normalizeStatus(value, fallback = "draft") {
  const status = value || fallback;
  if (!STATUS_VALUES.has(status)) throw new Error(`Invalid status: ${status}`);
  return status;
}

function compactObject(row) {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined));
}

async function upsertOne(supabase, table, row, conflict) {
  const { data, error } = await supabase
    .from(table)
    .upsert(compactObject(row), { onConflict: conflict })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function loadSeed() {
  return JSON.parse(await fs.readFile(seedPath, "utf8"));
}

async function readSetting(supabase, cityId, key) {
  try {
    const { data, error } = await supabase
      .from("city_settings")
      .select("value")
      .eq("city_id", cityId)
      .eq("key", key)
      .maybeSingle();
    if (error && error.code !== "PGRST205" && error.code !== "42P01") throw error;
    if (data?.value != null) return data.value;
  } catch (error) {
    if (error.code !== "PGRST205" && error.code !== "42P01") throw error;
  }

  const { data: fallback, error: fallbackError } = await supabase
    .from("source_candidates")
    .select("raw,created_at")
    .eq("city_id", cityId)
    .eq("title", `__setting:${key}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (fallbackError) throw fallbackError;
  if (fallback?.raw && "value" in fallback.raw) return fallback.raw.value;

  const seed = await loadSeed();
  return seed[key];
}

async function saveSetting(supabase, cityId, key, value) {
  try {
    await upsertOne(supabase, "city_settings", {
      city_id: cityId,
      key,
      value,
      updated_at: new Date().toISOString()
    }, "city_id,key");
    return "city_settings";
  } catch (error) {
    if (error.code !== "PGRST205" && error.code !== "42P01") throw error;
  }

  const title = `__setting:${key}`;
  const { error: deleteError } = await supabase
    .from("source_candidates")
    .delete()
    .eq("city_id", cityId)
    .eq("title", title);
  if (deleteError) throw deleteError;

  const { error: insertError } = await supabase
    .from("source_candidates")
    .insert({
      city_id: cityId,
      status: "archived",
      title,
      summary: `OpenClaw setting fallback for ${key}`,
      raw: {
        kind: "city_setting",
        key,
        value,
        updated_at: new Date().toISOString()
      }
    });
  if (insertError) throw insertError;
  return "source_candidates";
}

function cleanBase64(value) {
  return String(value || "").replace(/^data:[^;]+;base64,/, "").replace(/\s/g, "");
}

function extensionFromContentType(contentType) {
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/gif") return "gif";
  return "bin";
}

async function ensureImageBucket(supabase, bucket) {
  const { data, error } = await supabase.storage.getBucket(bucket);
  if (!error && data) return;
  const { error: createError } = await supabase.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"]
  });
  if (createError && !String(createError.message || "").toLowerCase().includes("already exists")) throw createError;
}

async function resolveImageUrl(supabase, citySlug, image) {
  if (image.url || image.remoteUrl || image.imageUrl) {
    return {
      url: image.url || image.remoteUrl || image.imageUrl,
      storage: "remote_url"
    };
  }

  const base64 = cleanBase64(image.dataBase64 || image.base64 || image.data);
  if (!base64) throw new Error("Each generated image needs url or dataBase64.");

  const contentType = image.contentType || image.mimeType || "image/png";
  if (!contentType.startsWith("image/")) throw new Error(`Unsupported image content type: ${contentType}`);

  const bytes = Buffer.from(base64, "base64");
  if (!bytes.length) throw new Error("Image dataBase64 decoded to an empty file.");
  if (bytes.length > 10 * 1024 * 1024) throw new Error("Image upload exceeds 10MB.");

  const bucket = process.env.PUBLISH_IMAGE_BUCKET || "nature-coast-pulse";
  await ensureImageBucket(supabase, bucket);

  const id = slugify(image.id || image.name || "openclaw-image") || "openclaw-image";
  const ext = extensionFromContentType(contentType);
  const filename = slugify((image.filename || `${id}.${ext}`).replace(/\.[^.]+$/, "")) + `.${ext}`;
  const objectPath = `${citySlug}/${id}/${filename}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(objectPath, bytes, {
      contentType,
      upsert: true
    });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  return {
    url: data.publicUrl,
    storage: `supabase_storage:${bucket}`,
    path: objectPath
  };
}

async function applyImageTarget(supabase, city, image, resolvedUrl) {
  const target = image.target || {};
  const type = target.type || image.targetType;
  if (!type) return { target: "none", url: resolvedUrl };

  if (type === "place") {
    const slug = target.id || target.slug || target.placeId || image.placeId;
    if (!slug) throw new Error("Image target place needs id or slug.");
    const { error } = await supabase
      .from("places")
      .update({
        image_url: resolvedUrl,
        updated_at: new Date().toISOString()
      })
      .eq("city_id", city.id)
      .eq("slug", slug);
    if (error) throw error;
    return { target: `place:${slug}`, url: resolvedUrl };
  }

  if (type === "categoryImage") {
    const category = target.category || image.category;
    if (!category) throw new Error("Image target categoryImage needs category.");
    const categoryImages = {
      ...(await readSetting(supabase, city.id, "categoryImages") || {})
    };
    categoryImages[category] = resolvedUrl;
    const storage = await saveSetting(supabase, city.id, "categoryImages", categoryImages);
    return { target: `categoryImage:${category}`, url: resolvedUrl, storage };
  }

  if (type === "setting") {
    const key = target.key || image.settingKey;
    if (!key || !SETTING_KEYS.has(key)) throw new Error("Image target setting needs an allowed key.");
    const value = target.value || {};
    const storage = await saveSetting(supabase, city.id, key, {
      ...value,
      image: resolvedUrl
    });
    return { target: `setting:${key}`, url: resolvedUrl, storage };
  }

  throw new Error(`Unsupported image target type: ${type}`);
}

async function ensureCity(supabase, citySlug, cityInput = {}) {
  const slug = cityInput.slug || citySlug || "nature-coast";
  const { data: existing, error } = await supabase
    .from("cities")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (existing && !Object.keys(cityInput).length) return existing;

  return upsertOne(supabase, "cities", {
    slug,
    name: cityInput.name || existing?.name || "Nature Coast Pulse",
    region: cityInput.region || existing?.region || "Florida Nature Coast",
    timezone: cityInput.timezone || existing?.timezone || "America/New_York",
    lanes: cityInput.lanes || existing?.lanes || [],
    updated_at: new Date().toISOString()
  }, "slug");
}

function normalizePlace(place, cityId) {
  const slug = place.slug || place.id || slugify(place.name);
  if (!slug) throw new Error("Each place needs id, slug, or name.");
  if (!place.name) throw new Error(`Place ${slug} needs name.`);
  if (!place.area) throw new Error(`Place ${slug} needs area.`);
  if (!place.category) throw new Error(`Place ${slug} needs category.`);
  if (!place.blurb) throw new Error(`Place ${slug} needs blurb.`);
  if (!place.map && !place.mapUrl) throw new Error(`Place ${slug} needs map or mapUrl.`);
  return {
    city_id: cityId,
    slug,
    status: normalizeStatus(place.status, "published"),
    sort_order: place.sortOrder ?? place.sort_order ?? 100,
    name: place.name,
    area: place.area,
    category: place.category,
    tags: place.tags || [],
    rating: place.rating || null,
    blurb: place.blurb,
    map_url: place.map || place.mapUrl,
    web_url: place.web || place.webUrl || null,
    image_url: place.image || place.imageUrl || null,
    source_url: place.sourceUrl || place.source_url || null,
    verified_at: place.verifiedAt || place.verified_at || null,
    updated_at: new Date().toISOString()
  };
}

function normalizeDayTrip(trip, cityId, index) {
  const slug = trip.slug || trip.id || slugify(trip.title);
  if (!slug) throw new Error("Each day trip needs id, slug, or title.");
  if (!trip.title) throw new Error(`Day trip ${slug} needs title.`);
  return {
    city_id: cityId,
    slug,
    status: normalizeStatus(trip.status, "published"),
    sort_order: trip.sortOrder ?? trip.sort_order ?? index + 1,
    kicker: trip.kicker || "Day trip",
    title: trip.title,
    body: trip.body || trip.dek || trip.summary || "",
    tags: trip.tags || [],
    source_notes: trip.sourceNotes || trip.source_notes || [],
    publish_week: trip.publishWeek || trip.publish_week || null,
    updated_at: new Date().toISOString()
  };
}

function normalizeIssue(issue, cityId) {
  const slug = issue.slug || slugify(issue.title || issue.subject);
  if (!slug) throw new Error("Issue needs slug, title, or subject.");
  if (!issue.title) throw new Error(`Issue ${slug} needs title.`);
  if (!issue.subject) throw new Error(`Issue ${slug} needs subject.`);
  return {
    city_id: cityId,
    slug,
    status: normalizeStatus(issue.status, "draft"),
    label: issue.label || null,
    kicker: issue.kicker || null,
    title: issue.title,
    subject: issue.subject,
    summary: issue.summary || "",
    picks: issue.picks || [],
    cards: issue.cards || [],
    publish_date: issue.publishDate || issue.publish_date || null,
    updated_at: new Date().toISOString()
  };
}

function normalizeSource(source, cityId) {
  if (!source.name) throw new Error("Each source needs name.");
  if (!source.url) throw new Error(`Source ${source.name} needs url.`);
  return {
    city_id: cityId,
    name: source.name,
    url: source.url,
    lane: source.lane || "general",
    note: source.note || null,
    active: source.active ?? true,
    last_checked_at: source.lastCheckedAt || source.last_checked_at || null
  };
}

function normalizeCandidate(candidate, cityId) {
  if (!candidate.title) throw new Error("Each source candidate needs title.");
  return {
    city_id: cityId,
    status: normalizeStatus(candidate.status, "draft"),
    title: candidate.title,
    url: candidate.url || null,
    starts_at: candidate.startsAt || candidate.starts_at || null,
    ends_at: candidate.endsAt || candidate.ends_at || null,
    location: candidate.location || null,
    summary: candidate.summary || null,
    raw: candidate.raw || candidate
  };
}

function publishPayload(body) {
  const payload = body.publish || body.data || body;
  return {
    city: payload.city || null,
    places: asArray(payload.places, "places"),
    dayTrips: asArray(payload.dayTrips || payload.day_trips, "dayTrips"),
    issue: payload.issue || payload.weeklyIssue || payload.weekly_issue || null,
    sources: asArray(payload.sources, "sources"),
    sourceCandidates: asArray(payload.sourceCandidates || payload.source_candidates, "sourceCandidates"),
    images: asArray(payload.images || payload.assets, "images"),
    settings: asObject(payload.settings || payload.config, "settings")
  };
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!isAuthed(req)) {
    return res.status(process.env.PUBLISH_API_KEY || process.env.OPENCLAW_PUBLISH_KEY ? 401 : 503).json({
      error: process.env.PUBLISH_API_KEY || process.env.OPENCLAW_PUBLISH_KEY
        ? "Unauthorized"
        : "Set PUBLISH_API_KEY or OPENCLAW_PUBLISH_KEY before publishing."
    });
  }

  let body;
  try {
    body = parseBody(req);
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const dryRun = Boolean(body.dryRun || body.dry_run);
  let payload;
  try {
    payload = publishPayload(body);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const counts = {
    places: payload.places.length,
    dayTrips: payload.dayTrips.length,
    sources: payload.sources.length,
    sourceCandidates: payload.sourceCandidates.length,
    images: payload.images.length,
    settings: Object.keys(payload.settings).filter(key => SETTING_KEYS.has(key)).length,
    issue: payload.issue ? 1 : 0
  };
  if (dryRun) return res.status(200).json({ ok: true, dryRun: true, counts });

  const supabase = supabaseClient();
  if (!supabase) return res.status(503).json({ error: "Supabase env vars are not configured." });

  try {
    const city = await ensureCity(supabase, body.city || payload.city?.slug, payload.city || {});
    const storage = { settings: {}, images: [] };

    for (const place of payload.places) {
      await upsertOne(supabase, "places", normalizePlace(place, city.id), "city_id,slug");
    }
    for (const [index, trip] of payload.dayTrips.entries()) {
      await upsertOne(supabase, "day_trips", normalizeDayTrip(trip, city.id, index), "city_id,slug");
    }
    if (payload.issue) {
      await upsertOne(supabase, "weekly_issues", normalizeIssue(payload.issue, city.id), "city_id,slug");
    }
    for (const source of payload.sources) {
      await upsertOne(supabase, "sources", normalizeSource(source, city.id), "city_id,url");
    }
    if (payload.sourceCandidates.length) {
      const rows = payload.sourceCandidates.map(candidate => normalizeCandidate(candidate, city.id));
      const { error } = await supabase.from("source_candidates").insert(rows);
      if (error) throw error;
    }
    for (const [key, value] of Object.entries(payload.settings)) {
      if (!SETTING_KEYS.has(key)) continue;
      storage.settings[key] = await saveSetting(supabase, city.id, key, value);
    }
    for (const image of payload.images) {
      const resolved = await resolveImageUrl(supabase, city.slug, image);
      const applied = await applyImageTarget(supabase, city, image, resolved.url);
      storage.images.push({
        id: image.id || image.name || null,
        url: resolved.url,
        storage: resolved.storage,
        path: resolved.path || null,
        target: applied.target
      });
    }

    return res.status(200).json({ ok: true, city: city.slug, counts, storage });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || "Publish failed." });
  }
}
