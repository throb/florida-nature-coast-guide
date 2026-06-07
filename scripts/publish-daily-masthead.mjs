import fs from "node:fs";
import path from "node:path";

const city = readArg("--city") || "nature-coast";
const date = readArg("--date") || easternDate(new Date());
const dryRun = hasArg("--dry-run");
const verify = !hasArg("--no-verify");
const direct = hasArg("--direct");
const endpoint = readArg("--endpoint") || process.env.PUBLISH_ENDPOINT || process.env.PUBLISH_API_URL || "http://127.0.0.1:3000/api/publish";

loadDotEnv(path.join(process.cwd(), ".env"));

const commonsSearches = [
  "Crystal River Florida springs",
  "Homosassa Springs Florida",
  "Rainbow Springs State Park Florida",
  "Silver Springs State Park Florida",
  "Cedar Key Florida",
  "Paynes Prairie Preserve State Park",
  "Withlacoochee State Trail Florida",
  "Crystal River Preserve State Park",
  "Fort Island Gulf Beach",
  "Ozello Florida",
  "Florida Nature Coast",
  "Florida Gulf Coast marsh",
  "manatee Crystal River Florida",
  "kayak Crystal River Florida",
  "Ocala National Forest springs",
  "Yankeetown Florida coast",
  "Weeki Wachee River Florida",
  "Chassahowitzka River Florida",
  "Dunnellon Florida Rainbow River",
  "Inglis Florida Withlacoochee"
];

const fallbackImages = [
  {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Three_sisters_springs_near_crystal_river_national_wildlife_refuge.jpg?width=1800",
    imageLabel: "Three Sisters Springs, Crystal River",
    imageCredit: "via Wikimedia Commons"
  },
  {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Crystal_River_near_Hunter_Spring_Run_-_panoramio.jpg?width=1800",
    imageLabel: "Crystal River near Hunter Spring Run",
    imageCredit: "via Wikimedia Commons"
  },
  {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Rainbow_spgs_florida.JPG?width=1800",
    imageLabel: "Rainbow Springs State Park",
    imageCredit: "via Wikimedia Commons"
  },
  {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Silver_Springs_State_Park_-_Headspring_Entrance_Sign.jpg?width=1800",
    imageLabel: "Silver Springs State Park",
    imageCredit: "via Wikimedia Commons"
  },
  {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Paynes_Prairie_observation_tower_view.jpg?width=1800",
    imageLabel: "Paynes Prairie observation tower view",
    imageCredit: "via Wikimedia Commons"
  },
  {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Cedar_Key_Aerial.jpg?width=1800",
    imageLabel: "Cedar Key aerial shoreline",
    imageCredit: "via Wikimedia Commons"
  },
  {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Crystal_River_Preserve_State_Park.jpg?width=1800",
    imageLabel: "Crystal River Preserve State Park",
    imageCredit: "via Wikimedia Commons"
  },
  {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Crystal_River_Preserve_State_Park_2.jpg?width=1800",
    imageLabel: "Crystal River Preserve marshland",
    imageCredit: "via Wikimedia Commons"
  },
  {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Dolphin_at_Fort_Island_Gulf_Beach.jpg?width=1800",
    imageLabel: "Fort Island Gulf Beach",
    imageCredit: "via Wikimedia Commons"
  },
  {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Crystal_River_in_Crystal_River05.jpg?width=1800",
    imageLabel: "Crystal River waterway",
    imageCredit: "via Wikimedia Commons"
  },
  {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Crystal_Street_in_Crystal_River,_Florida.jpg?width=1800",
    imageLabel: "Crystal River streetscape",
    imageCredit: "via Wikimedia Commons"
  },
  {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/The_fish_market_in_Homosassa,_Florida.jpg?width=1800",
    imageLabel: "Homosassa fish market",
    imageCredit: "via Wikimedia Commons"
  },
  {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Crystal_River_National_Wildlife_Refuge.jpg?width=1800",
    imageLabel: "Crystal River National Wildlife Refuge",
    imageCredit: "via Wikimedia Commons"
  },
  {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Weeki_Wachee_Springs_State_Park.jpg?width=1800",
    imageLabel: "Weeki Wachee Springs State Park",
    imageCredit: "via Wikimedia Commons"
  },
  {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Chassahowitzka_River.jpg?width=1800",
    imageLabel: "Chassahowitzka River",
    imageCredit: "via Wikimedia Commons"
  },
  {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Hunter_Springs_Park_Crystal_River_Florida.jpg?width=1800",
    imageLabel: "Hunter Springs Park, Crystal River",
    imageCredit: "via Wikimedia Commons"
  },
  {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Yankeetown_FL_Withlacoochee_River.jpg?width=1800",
    imageLabel: "Withlacoochee River near Yankeetown",
    imageCredit: "via Wikimedia Commons"
  },
  {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Marjorie_Harris_Carr_Cross_Florida_Greenway.jpg?width=1800",
    imageLabel: "Marjorie Harris Carr Cross Florida Greenway",
    imageCredit: "via Wikimedia Commons"
  },
  {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Salt_Springs,_Ocala_National_Forest.jpg?width=1800",
    imageLabel: "Salt Springs, Ocala National Forest",
    imageCredit: "via Wikimedia Commons"
  },
  {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Juniper_Springs_Recreation_Area.jpg?width=1800",
    imageLabel: "Juniper Springs Recreation Area",
    imageCredit: "via Wikimedia Commons"
  },
  {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Alexander_Springs_Recreation_Area.jpg?width=1800",
    imageLabel: "Alexander Springs Recreation Area",
    imageCredit: "via Wikimedia Commons"
  },
  {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Homosassa_Springs_Wildlife_State_Park.jpg?width=1800",
    imageLabel: "Homosassa Springs Wildlife State Park",
    imageCredit: "via Wikimedia Commons"
  },
  {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Downtown_Inverness,_Florida.jpg?width=1800",
    imageLabel: "Downtown Inverness",
    imageCredit: "via Wikimedia Commons"
  },
  {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Rainbow_River_Dunnellon_Florida.jpg?width=1800",
    imageLabel: "Rainbow River near Dunnellon",
    imageCredit: "via Wikimedia Commons"
  },
  {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Cross_Florida_Greenway_bridge.jpg?width=1800",
    imageLabel: "Cross Florida Greenway",
    imageCredit: "via Wikimedia Commons"
  },
  {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Withlacoochee_State_Trail_looking_north_at_point_where_it_makes_a_tee_intersection_with_the_Good_Neighbor_Trail_Aug_8_2020_at_location_28%C2%B035%2722.2%22N_82%C2%B013%2742.3%22W.jpg?width=1800",
    imageLabel: "Withlacoochee State Trail",
    imageCredit: "via Wikimedia Commons"
  }
];

const image = await selectMastheadImage(date);
const updatedAt = `${date}T03:00:00${easternOffsetSuffix(date)}`;
const payload = {
  city,
  dryRun,
  publish: {
    images: [
      {
        id: `daily-this-week-hero-${date}`,
        url: image.url,
        target: {
          type: "setting",
          key: "homepage",
          value: {
            imageLabel: image.imageLabel,
            imageCredit: image.imageCredit,
            updatedAt,
            sourceQuery: image.sourceQuery || null
          }
        }
      }
    ]
  }
};

const key = process.env.PUBLISH_API_KEY || process.env.OPENCLAW_PUBLISH_KEY;
if (!key) {
  fail("Missing PUBLISH_API_KEY or OPENCLAW_PUBLISH_KEY. Put it in .env or the process environment.");
}

const publish = direct
  ? await callLocalHandler("../api/publish.js", {
      method: "POST",
      headers: { authorization: `Bearer ${key}` },
      body: payload
    })
  : await postJson(endpoint, payload, key);
const result = {
  ok: publish.ok,
  dryRun,
  date,
  endpoint: direct ? "direct:api/publish.js" : endpoint,
  masthead: {
    image: image.url,
    imageLabel: image.imageLabel,
    imageCredit: image.imageCredit,
    updatedAt,
    sourceQuery: image.sourceQuery || null
  },
  publish
};

if (verify && !dryRun) {
  const cityPulseUrl = new URL(endpoint);
  cityPulseUrl.pathname = cityPulseUrl.pathname.replace(/\/api\/publish$/, "/api/city-pulse");
  cityPulseUrl.search = `?city=${encodeURIComponent(city)}`;
  const readback = direct
    ? await callLocalHandler("../api/city-pulse.js", {
        method: "GET",
        headers: {},
        query: { city }
      })
    : await getJson(cityPulseUrl.toString());
  result.verify = {
    endpoint: direct ? "direct:api/city-pulse.js" : cityPulseUrl.toString(),
    image: readback.homepage?.image || null,
    imageLabel: readback.homepage?.imageLabel || null,
    imageCredit: readback.homepage?.imageCredit || null,
    updatedAt: readback.homepage?.updatedAt || null,
    sourceQuery: readback.homepage?.sourceQuery || null,
    matched: readback.homepage?.image === image.url && readback.homepage?.imageLabel === image.imageLabel
  };
  if (!result.verify.matched) process.exitCode = 1;
}

console.log(JSON.stringify(result, null, 2));

function readArg(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] || null;
}

function hasArg(name) {
  return process.argv.includes(name);
}

function loadDotEnv(file) {
  if (!fs.existsSync(file)) return;
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...valueParts] = trimmed.split("=");
    process.env[key.trim()] = valueParts.join("=").trim().replace(/^['"]|['"]$/g, "");
  }
}

function dayOfYear(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const current = Date.UTC(year, month - 1, day);
  const start = Date.UTC(year, 0, 0);
  return Math.floor((current - start) / 86400000);
}

function easternDate(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function easternOffsetSuffix(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const probe = new Date(Date.UTC(year, month - 1, day, 12));
  const label = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    timeZoneName: "shortOffset"
  }).formatToParts(probe).find(part => part.type === "timeZoneName")?.value || "GMT-5";
  const match = label.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!match) return "-05:00";
  return `${match[1]}${match[2].padStart(2, "0")}:${match[3] || "00"}`;
}

async function selectMastheadImage(isoDate) {
  const day = dayOfYear(isoDate);
  const explicitQuery = readArg("--query");
  const query = explicitQuery || commonsSearches[day % commonsSearches.length];
  if (!hasArg("--fallback-only")) {
    try {
      const candidates = await fetchCommonsCandidates(query);
      if (candidates.length) {
        return {
          ...candidates[Math.floor(day / commonsSearches.length) % candidates.length],
          sourceQuery: query
        };
      }
    } catch (error) {
      if (hasArg("--strict-images")) throw error;
    }
  }
  return {
    ...fallbackImages[day % fallbackImages.length],
    sourceQuery: "fallback"
  };
}

async function fetchCommonsCandidates(query) {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrnamespace: "6",
    gsrsearch: query,
    gsrlimit: "30",
    prop: "imageinfo",
    iiprop: "url|mime|extmetadata|size",
    iiurlwidth: "1800",
    format: "json",
    formatversion: "2"
  });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`);
  const body = await response.text();
  if (!response.ok) throw new Error(`Commons search failed: HTTP ${response.status} ${body.slice(0, 200)}`);
  const data = JSON.parse(body);
  return (data.query?.pages || [])
    .map(page => commonsPageToImage(page))
    .filter(Boolean)
    .filter(image => isUsefulMasthead(image));
}

function commonsPageToImage(page) {
  const info = page.imageinfo?.[0];
  if (!info || !info.mime?.startsWith("image/")) return null;
  if (info.mime === "image/svg+xml") return null;
  const title = page.title || "";
  const meta = info.extmetadata || {};
  return {
    url: info.thumburl || info.url,
    imageLabel: cleanCommonsText(meta.ObjectName?.value) || cleanFileTitle(title),
    imageCredit: commonsCredit(meta),
    width: info.thumbwidth || info.width || 0,
    height: info.thumbheight || info.height || 0,
    title
  };
}

function isUsefulMasthead(image) {
  const title = `${image.title} ${image.imageLabel}`.toLowerCase();
  const reject = ["map", "locator", "logo", "seal", "flag", "sign", "marker", "diagram", "chart", "svg"];
  if (reject.some(word => title.includes(word))) return false;
  if (image.width && image.height && image.width < image.height * 1.12) return false;
  return Boolean(image.url && image.imageLabel);
}

function commonsCredit(meta) {
  const artist = cleanCommonsText(meta.Artist?.value);
  if (artist && artist.length <= 90 && !artist.includes("http")) return `Wikimedia Commons / ${artist}`;
  const credit = cleanCommonsText(meta.Credit?.value);
  if (credit && credit.length <= 90 && !credit.includes("http")) return `Wikimedia Commons / ${credit}`;
  return "via Wikimedia Commons";
}

function cleanCommonsText(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s*\(\d{6,}\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanFileTitle(title) {
  return String(title || "")
    .replace(/^File:/, "")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/\s*\(\d{6,}\)/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
  const data = parseJson(text);
  if (!response.ok) fail(`Publish failed: HTTP ${response.status} ${text}`);
  return data;
}

async function getJson(url) {
  const response = await fetch(url);
  const text = await response.text();
  if (!response.ok) fail(`Readback failed: HTTP ${response.status} ${text}`);
  return parseJson(text);
}

async function callLocalHandler(modulePath, req) {
  const handler = (await import(modulePath)).default;
  let statusCode = 200;
  let body = null;
  const res = {
    setHeader() {},
    status(code) {
      statusCode = code;
      return this;
    },
    json(value) {
      body = value;
      return this;
    },
    end(value) {
      body = value || null;
      return this;
    }
  };
  await handler(req, res);
  if (statusCode < 200 || statusCode >= 300) {
    fail(`Local handler failed: HTTP ${statusCode} ${JSON.stringify(body)}`);
  }
  return body;
}

function parseJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
