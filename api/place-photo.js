const PLACES_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const PLACES_DETAILS_URL = "https://places.googleapis.com/v1/places/";
const PLACE_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.googleMapsUri",
  "places.websiteUri",
  "places.businessStatus",
  "places.types",
  "places.photos.name",
  "places.photos.authorAttributions"
].join(",");
const PLACE_DETAIL_FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "googleMapsUri",
  "websiteUri",
  "businessStatus",
  "types",
  "photos.name",
  "photos.authorAttributions"
].join(",");

function safeFallback(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "http:") return url.toString();
  } catch {
    return null;
  }
  return null;
}

async function findPlacePhoto(query, apiKey) {
  const expectedName = String(query || "").split(",")[0].trim();
  const searchResponse = await fetch(PLACES_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": PLACE_FIELD_MASK
    },
    body: JSON.stringify({
      textQuery: query,
      maxResultCount: 5
    })
  });

  if (!searchResponse.ok) {
    throw new Error(`Places search failed: ${searchResponse.status}`);
  }

  const searchPayload = await searchResponse.json();
  const places = Array.isArray(searchPayload?.places) ? searchPayload.places : [];
  const place = chooseBestPlace(places, expectedName) || places[0];
  if (!place) return null;
  return getPhotoFromPlace(place, apiKey);
}

async function findPlacePhotoById(placeId, apiKey) {
  const cleanId = String(placeId || "").trim().replace(/^places\//, "");
  if (!cleanId) return null;

  const detailResponse = await fetch(`${PLACES_DETAILS_URL}${encodeURIComponent(cleanId)}`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": PLACE_DETAIL_FIELD_MASK
    }
  });

  if (!detailResponse.ok) {
    throw new Error(`Place details failed: ${detailResponse.status}`);
  }

  const place = await detailResponse.json();
  return getPhotoFromPlace(place, apiKey);
}

function normalizeName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(the|restaurant|bar|grill|tiki|cafe|coffee|roasters|bakery|kitchen)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function chooseBestPlace(places, expectedName) {
  const expected = normalizeName(expectedName);
  if (!expected) return places[0];

  return places.find((place) => normalizeName(place?.displayName?.text) === expected)
    || places.find((place) => {
      const actual = normalizeName(place?.displayName?.text);
      return actual && (actual.includes(expected) || expected.includes(actual));
    })
    || places[0];
}

async function getPhotoFromPlace(place, apiKey) {
  const photo = place?.photos?.[0];
  const photoName = photo?.name;
  if (!photoName) return null;

  const mediaUrl = new URL(`https://places.googleapis.com/v1/${photoName}/media`);
  mediaUrl.searchParams.set("maxWidthPx", "1200");
  mediaUrl.searchParams.set("skipHttpRedirect", "true");

  const mediaResponse = await fetch(mediaUrl, {
    headers: {
      "X-Goog-Api-Key": apiKey
    }
  });

  if (!mediaResponse.ok) {
    throw new Error(`Place photo lookup failed: ${mediaResponse.status}`);
  }

  const mediaPayload = await mediaResponse.json();
  return {
    photoUri: mediaPayload?.photoUri || null,
    attributions: photo.authorAttributions || [],
    place: {
      id: place?.id || null,
      name: place?.displayName?.text || null,
      address: place?.formattedAddress || null,
      googleMapsUri: place?.googleMapsUri || null,
      websiteUri: place?.websiteUri || null,
      businessStatus: place?.businessStatus || null,
      types: place?.types || []
    }
  };
}

export default async function handler(req, res) {
  const query = String(req.query.query || "").trim();
  const placeId = String(req.query.placeId || req.query.googlePlaceId || "").trim();
  const fallback = safeFallback(req.query.fallback);
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
  const wantsJson = req.query.format === "json";

  if (!query && !placeId) {
    if (wantsJson) return res.status(400).json({ error: "Missing place photo query or placeId.", photoUri: fallback });
    if (fallback) return res.redirect(302, fallback);
    return res.status(400).json({ error: "Missing place photo query or placeId." });
  }

  if (!apiKey) {
    if (wantsJson) {
      res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
      return res.status(200).json({ photoUri: fallback, attributions: [], fallback: true });
    }
    if (fallback) {
      res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
      return res.redirect(302, fallback);
    }
    return res.status(501).json({ error: "Google Maps API key is not configured." });
  }

  try {
    const photo = placeId ? await findPlacePhotoById(placeId, apiKey) : await findPlacePhoto(query, apiKey);
    const target = photo?.photoUri || fallback;
    if (wantsJson) {
      res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
      return res.status(200).json({
        photoUri: target,
        attributions: photo?.attributions || [],
        place: photo?.place || null,
        fallback: !photo?.photoUri
      });
    }
    if (!target) return res.status(404).json({ error: "No place photo found." });
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    return res.redirect(302, target);
  } catch (error) {
    console.error(error);
    if (wantsJson) {
      res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=86400");
      return res.status(fallback ? 200 : 502).json({
        error: fallback ? undefined : (error.message || "Place photo lookup failed."),
        photoUri: fallback,
        attributions: [],
        fallback: true
      });
    }
    if (fallback) {
      res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=86400");
      return res.redirect(302, fallback);
    }
    return res.status(502).json({ error: error.message || "Place photo lookup failed." });
  }
}
