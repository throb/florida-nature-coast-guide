import fs from "node:fs/promises";

const data = JSON.parse(await fs.readFile("data/nature-coast.seed.json", "utf8"));
const now = new Date();
const weekSlug = now.toISOString().slice(0, 10);
const draftDir = "data/drafts";
const tripPool = data.places.filter(place => place.category === "trip");
const spotlightPool = data.places.filter(place => ["water", "night", "trip", "people"].includes(place.category));
const seed = Math.floor(now.getTime() / (1000 * 60 * 60 * 24 * 7));
const spotlight = spotlightPool[seed % spotlightPool.length];
const trips = [0, 1, 2].map(offset => tripPool[(seed + offset) % tripPool.length]);

const draft = {
  city: data.city.slug,
  status: "draft",
  publishWeek: weekSlug,
  title: `Nature Coast Pulse draft for ${weekSlug}`,
  subject: `${spotlight.name}, ${trips[0].name}, and a smarter Nature Coast week`,
  spotlight: spotlight.id,
  dayTripCandidates: trips.map(place => ({
    placeId: place.id,
    title: place.name,
    area: place.area,
    tags: place.tags,
    reason: place.blurb
  })),
  reviewChecklist: [
    "Verify official source links and hours before publishing.",
    "Check weather/marine risk before recommending water-heavy plans.",
    "Confirm sponsor copy is labeled and category-fit.",
    "Publish only after human review."
  ]
};

await fs.mkdir(draftDir, { recursive: true });
const file = `${draftDir}/${weekSlug}.json`;
await fs.writeFile(file, JSON.stringify(draft, null, 2) + "\n");
console.log(`Wrote ${file}`);
