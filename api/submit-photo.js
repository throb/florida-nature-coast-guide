import { createClient } from "@supabase/supabase-js";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body;
}

function supabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function cleanBase64(value) {
  return String(value || "").replace(/^data:[^;]+;base64,/, "").replace(/\s/g, "");
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function extensionFromContentType(contentType) {
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  return "bin";
}

async function ensurePrivateBucket(supabase, bucket) {
  const { data, error } = await supabase.storage.getBucket(bucket);
  if (!error && data) return;
  const { error: createError } = await supabase.storage.createBucket(bucket, {
    public: false,
    fileSizeLimit: MAX_IMAGE_BYTES,
    allowedMimeTypes: Array.from(ALLOWED_IMAGE_TYPES)
  });
  if (createError && !String(createError.message || "").toLowerCase().includes("already exists")) throw createError;
}

async function ensureCity(supabase, citySlug) {
  const slug = citySlug || "nature-coast";
  const { data: existing, error } = await supabase
    .from("cities")
    .select("id,slug")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (existing) return existing;

  const { data, error: insertError } = await supabase
    .from("cities")
    .insert({
      slug,
      name: "Nature Coast Pulse",
      region: "Florida Nature Coast",
      timezone: "America/New_York"
    })
    .select("id,slug")
    .single();
  if (insertError) throw insertError;
  return data;
}

async function storeSubmittedImage(supabase, citySlug, body) {
  const contentType = String(body.contentType || body.mimeType || "").toLowerCase();
  const dataBase64 = cleanBase64(body.dataBase64 || body.base64 || body.data);

  if (dataBase64) {
    if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
      throw new Error("Use a JPEG, PNG, or WebP image.");
    }
    const bytes = Buffer.from(dataBase64, "base64");
    if (!bytes.length) throw new Error("Image upload is empty.");
    if (bytes.length > MAX_IMAGE_BYTES) throw new Error("Image must be 8MB or smaller.");

    const bucket = process.env.PHOTO_SUBMISSION_BUCKET || "nature-coast-photo-submissions";
    await ensurePrivateBucket(supabase, bucket);

    const ext = extensionFromContentType(contentType);
    const name = slugify(body.imageLabel || body.location || body.photographerName || "masthead-photo") || "masthead-photo";
    const objectPath = `${citySlug}/pending/${new Date().toISOString().slice(0, 10)}/${Date.now()}-${name}.${ext}`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(objectPath, bytes, {
        contentType,
        upsert: false
      });
    if (error) throw error;

    return {
      kind: "storage",
      bucket,
      path: objectPath,
      contentType,
      bytes: bytes.length
    };
  }

  const imageUrl = String(body.imageUrl || body.url || "").trim();
  if (!/^https:\/\/.+/i.test(imageUrl)) {
    throw new Error("Upload an image or provide a public HTTPS image URL.");
  }
  return {
    kind: "remote_url",
    url: imageUrl
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body;
  try {
    body = parseBody(req);
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const photographerName = String(body.photographerName || body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const permission = Boolean(body.permission);
  if (!photographerName) return res.status(400).json({ error: "Photographer name is required." });
  if (!isEmail(email)) return res.status(400).json({ error: "Enter a valid email address." });
  if (!permission) return res.status(400).json({ error: "Confirm that you own the photo and allow Nature Coast Pulse to feature it." });

  const supabase = supabaseClient();
  if (!supabase) return res.status(503).json({ error: "Photo submission storage is not configured yet." });

  try {
    const city = await ensureCity(supabase, String(body.city || "nature-coast"));
    const image = await storeSubmittedImage(supabase, city.slug, body);
    const location = String(body.location || "").trim();
    const caption = String(body.caption || body.imageLabel || "").trim();
    const credit = String(body.credit || photographerName).trim();

    const { data, error } = await supabase
      .from("source_candidates")
      .insert({
        city_id: city.id,
        status: "review",
        title: `Masthead photo submission: ${caption || location || photographerName}`,
        url: image.kind === "remote_url" ? image.url : null,
        location: location || null,
        summary: caption || `Photo submitted by ${photographerName}`,
        raw: {
          kind: "masthead_photo_submission",
          submittedAt: new Date().toISOString(),
          photographerName,
          email,
          credit,
          location: location || null,
          caption: caption || null,
          creditUrl: String(body.creditUrl || "").trim() || null,
          discountOptIn: Boolean(body.discountOptIn),
          permission,
          image,
          moderation: {
            status: "pending_manual_review",
            notes: "Private review required before publishing. Reject nudity, explicit content, private people without consent, watermarks, low-quality images, and unrelated locations."
          }
        }
      })
      .select("id,status,title")
      .single();
    if (error) throw error;

    return res.status(200).json({
      ok: true,
      status: data.status,
      id: data.id,
      message: "Photo submitted for review."
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || "Photo submission failed." });
  }
}
