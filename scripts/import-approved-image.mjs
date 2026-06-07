import fs from "node:fs";
import path from "node:path";

const city = readArg("--city") || "nature-coast";
const sourceUrl = readArg("--url");
const id = readArg("--id") || "approved-image";
const label = readArg("--label") || "";
const credit = readArg("--credit") || "";
const filenameArg = readArg("--filename");
const dryRun = hasArg("--dry-run");
const endpoint = readArg("--endpoint") || process.env.PUBLISH_ENDPOINT || process.env.PUBLISH_API_URL || "http://127.0.0.1:3000/api/publish";

loadDotEnv(path.join(process.cwd(), ".env"));

if (!sourceUrl) fail("Missing --url.");
const url = parseUrl(sourceUrl);
assertAllowedImageSource(url);

const publishKey = process.env.PUBLISH_API_KEY || process.env.OPENCLAW_PUBLISH_KEY;
if (!dryRun && !publishKey) fail("PUBLISH_API_KEY or OPENCLAW_PUBLISH_KEY is required.");

const downloaded = await downloadImage(url);
const filename = filenameArg || filenameFromUrl(url, downloaded.contentType, id);
const image = {
  id,
  filename,
  contentType: downloaded.contentType,
  dataBase64: downloaded.bytes.toString("base64"),
  sourceUrl: url.toString(),
  imageLabel: label || undefined,
  imageCredit: credit || undefined
};

const payload = {
  city,
  dryRun,
  publish: {
    images: [image]
  }
};

if (dryRun) {
  console.log(JSON.stringify({
    ok: true,
    dryRun: true,
    id,
    filename,
    contentType: downloaded.contentType,
    bytes: downloaded.bytes.length,
    sourceUrl: url.toString()
  }, null, 2));
  process.exit(0);
}

const result = await postJson(endpoint, payload, publishKey);
const stored = result?.storage?.images?.[0];
if (!stored?.url) fail(`Image upload did not return a public URL: ${JSON.stringify(result)}`);

console.log(JSON.stringify({
  ok: true,
  id,
  url: stored.url,
  storage: stored.storage,
  path: stored.path,
  target: stored.target,
  nextStep: "Use this url as the card image in settings.guidePages.eats, then publish that setting and browser-verify the card."
}, null, 2));

function readArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] || null;
}

function hasArg(name) {
  return process.argv.includes(name);
}

function loadDotEnv(file) {
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const key = match[1];
    const value = match[2].replace(/^['"]|['"]$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

function parseUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Only http/https URLs are allowed.");
    return url;
  } catch (error) {
    fail(`Invalid --url: ${error.message}`);
  }
}

function assertAllowedImageSource(url) {
  const host = url.hostname.toLowerCase();
  const blocked = [
    "googleusercontent.com",
    "maps.googleapis.com",
    "places.googleapis.com",
    "streetviewpixels-pa.googleapis.com",
    "gstatic.com",
    "ggpht.com"
  ];
  if (blocked.some(domain => host === domain || host.endsWith(`.${domain}`))) {
    fail("Refusing to import Google/Places/Maps imagery. Store the Place ID and use Google live with attribution, or use a rights-cleared/business-approved image source.");
  }
}

async function downloadImage(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "NatureCoastInsider-OpenClawImageImporter/1.0"
    }
  });
  if (!response.ok) fail(`Image download failed: HTTP ${response.status}`);

  const contentType = String(response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(contentType)) {
    fail(`Unsupported content type: ${contentType || "unknown"}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length) fail("Downloaded image is empty.");
  if (bytes.length > 10 * 1024 * 1024) fail("Downloaded image exceeds 10MB.");
  return { bytes, contentType };
}

function filenameFromUrl(url, contentType, fallbackId) {
  const extByType = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif"
  };
  const ext = extByType[contentType] || "bin";
  const base = path.basename(url.pathname).replace(/\.[a-z0-9]+$/i, "") || fallbackId;
  return `${slugify(base) || slugify(fallbackId) || "approved-image"}.${ext}`;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function postJson(url, body, key) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!response.ok) fail(`Publish failed: HTTP ${response.status} ${text}`);
  return data;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
