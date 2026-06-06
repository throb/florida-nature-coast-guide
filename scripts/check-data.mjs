import fs from "node:fs/promises";

const data = JSON.parse(await fs.readFile("data/nature-coast.seed.json", "utf8"));
const requiredPlaceFields = ["id", "name", "area", "category", "tags", "blurb", "map"];
const categories = new Set(Object.keys(data.categoryLabels));

for (const field of ["city", "issue", "places", "dayTrips", "sources"]) {
  if (!data[field]) throw new Error(`Missing ${field}`);
}

for (const place of data.places) {
  for (const field of requiredPlaceFields) {
    if (!place[field] || (Array.isArray(place[field]) && !place[field].length)) {
      throw new Error(`Place ${place.name || place.id} missing ${field}`);
    }
  }
  if (!categories.has(place.category)) {
    throw new Error(`Place ${place.name} uses unknown category ${place.category}`);
  }
}

console.log(`Data OK: ${data.places.length} places, ${data.dayTrips.length} day trips, ${data.sources.length} sources.`);
