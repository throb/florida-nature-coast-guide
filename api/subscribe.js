import { createClient } from "@supabase/supabase-js";

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body;
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function supabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function saveSignupToSupabase(email, body) {
  const supabase = supabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("newsletter_signups")
    .upsert({
      email,
      city_slug: String(body.city || "nature-coast"),
      source: String(body.source || "site-signup"),
      status: "subscribed",
      provider: "supabase",
      metadata: {
        path: body.path || null,
        userAgent: body.userAgent || null
      },
      updated_at: new Date().toISOString()
    }, { onConflict: "email" })
    .select("email,status,provider")
    .single();

  if (error) throw error;
  return data;
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

  const email = String(body.email || "").trim().toLowerCase();
  if (!isEmail(email)) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }

  const apiKey = process.env.EMAILOCTOPUS_API_KEY;
  const listId = process.env.EMAILOCTOPUS_LIST_ID;
  if (!apiKey || !listId) {
    try {
      const signup = await saveSignupToSupabase(email, body);
      if (signup) {
        return res.status(200).json({
          ok: true,
          status: signup.status,
          provider: signup.provider,
          email
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Signup storage failed." });
    }

    return res.status(503).json({ error: "Signup storage is not configured yet." });
  }

  const payload = {
    api_key: apiKey,
    email_address: email,
    tags: ["nature-coast-pulse", "site-signup"]
  };

  if (process.env.EMAILOCTOPUS_STATUS) {
    payload.status = process.env.EMAILOCTOPUS_STATUS;
  }

  const response = await fetch(`https://emailoctopus.com/api/1.6/lists/${listId}/contacts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok && result.code !== "MEMBER_EXISTS_WITH_EMAIL_ADDRESS") {
    return res.status(response.status).json({
      error: result.message || "EmailOctopus signup failed.",
      code: result.code || "EMAILOCTOPUS_ERROR"
    });
  }

  try {
    await saveSignupToSupabase(email, {
      ...body,
      source: body.source || "site-signup-emailoctopus"
    });
  } catch (error) {
    console.error(error);
  }

  return res.status(200).json({
    ok: true,
    status: result.status || "EXISTING",
    provider: "emailoctopus",
    email
  });
}
