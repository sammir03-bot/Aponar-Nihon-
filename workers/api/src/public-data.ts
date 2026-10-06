// Read-only open data. All upstream URLs and query shapes are controlled here.
type Data = Record<string, unknown>;
const AGENT = "AponarNihon/1.1 (+https://app.aponar-nihon.workers.dev/contact)";
const OVERPASS = ["https://maps.mail.ru/osm/tools/overpass/api/interpreter", "https://overpass.private.coffee/api/interpreter"];
const OFF_FIELDS = "code,product_name,product_name_ja,product_name_en,brands,ingredients_text,ingredients_text_ja,ingredients_text_en,ingredients,labels_tags,image_front_small_url";
const obj = (v: unknown): Data => v && typeof v === "object" && !Array.isArray(v) ? v as Data : {};
const text = (v: unknown, max = 2000): string => typeof v === "string" ? v.replace(/<[^>]*>/g, "").trim().slice(0, max) : "";
const reply = (data: unknown, status = 200): Response => new Response(JSON.stringify(data), {status, headers: {
  "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff",
  ...(status === 429 || status === 503 ? {"retry-after": "60"} : {})
}});

export function validBarcode(code: string): boolean {
  if (!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(code)) return false;
  let sum = 0;
  for (let i = code.length - 2, weight = 3; i >= 0; i--, weight = weight === 3 ? 1 : 3) sum += Number(code[i]) * weight;
  return (10 - sum % 10) % 10 === Number(code.at(-1));
}

async function cached(key: string, seconds: number, load: () => Promise<unknown>): Promise<unknown> {
  const cache = typeof caches !== "undefined" ? (caches as CacheStorage & {default?: Cache}).default : undefined;
  const request = new Request("https://app.aponar-nihon.workers.dev/__open-data/" + key);
  if (cache) { try { const hit = await cache.match(request); if (hit) return await hit.json(); } catch { /* Cache is optional. */ } }
  const data = await load();
  if (cache) { try { await cache.put(request, new Response(JSON.stringify(data), {headers: {"content-type": "application/json", "cache-control": "public, max-age=" + seconds}})); } catch { /* Serve fresh data. */ } }
  return data;
}

async function fetchJson(url: string, init: RequestInit = {}, timeout = 14000): Promise<unknown> {
  const res = await fetch(url, {...init, headers: {"User-Agent": AGENT, "Accept": "application/json", ...init.headers}, signal: AbortSignal.timeout(timeout)});
  if (res.status === 429) throw new Error("rate_limited");
  if (!res.ok) throw new Error("upstream_" + res.status);
  const body = await res.text();
  if (body.length > 4_000_000) throw new Error("response_too_large");
  return JSON.parse(body) as unknown;
}

async function food(url: URL): Promise<Response> {
  const barcode = url.searchParams.get("barcode") || "";
  if (!validBarcode(barcode)) return reply({ok: false, error: "invalid_barcode"}, 400);
  try {
    const data = await cached("food-v1/" + barcode, 86400, async () => {
      let payload: Data;
      try { payload = obj(await fetchJson("https://world.openfoodfacts.org/api/v2/product/" + barcode + ".json?fields=" + OFF_FIELDS)); }
      catch (error) {
        if (error instanceof Error && error.message === "upstream_404") return {ok: true, found: false, barcode, source: "Open Food Facts"};
        throw error;
      }
      const p = obj(payload.product);
      if (payload.status === 0 || !Object.keys(p).length) return {ok: true, found: false, barcode, source: "Open Food Facts"};
      const ingredientList = Array.isArray(p.ingredients) ? p.ingredients.map(i => text(obj(i).text)).filter(Boolean).join("、") : "";
      return {ok: true, found: true, source: "Open Food Facts", product: {
        code: barcode, name: text(p.product_name_ja || p.product_name || p.product_name_en, 300), brand: text(p.brands, 500),
        ingredients: text(p.ingredients_text_ja || p.ingredients_text || p.ingredients_text_en, 20000) || ingredientList,
        image: /^https:\/\/images\.openfoodfacts\.org\//.test(text(p.image_front_small_url)) ? p.image_front_small_url : "",
        reportedHalalLabel: Array.isArray(p.labels_tags) && p.labels_tags.includes("en:halal"),
        sourceUrl: "https://world.openfoodfacts.org/product/" + barcode
      }};
    });
    return reply(data);
  } catch (error) {
    const limited = error instanceof Error && error.message === "rate_limited";
    return reply({ok: false, error: limited ? "rate_limited" : "food_service_unavailable"}, limited ? 429 : 503);
  }
}

export function distanceMeters(lat: number, lng: number, lat2: number, lng2: number): number {
  const rad = Math.PI / 180;
  const a = Math.sin((lat2 - lat) * rad / 2) ** 2 + Math.cos(lat * rad) * Math.cos(lat2 * rad) * Math.sin((lng2 - lng) * rad / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
}

export function parsePlaces(payload: unknown): Data[] {
  const elements = obj(payload).elements;
  if (!Array.isArray(elements)) throw new Error("invalid_map_response");
  const result: Data[] = [];
  for (const element of elements.slice(0, 1500)) {
    const e = obj(element), tags = obj(e.tags), center = obj(e.center);
    const lat = Number(e.lat ?? center.lat), lng = Number(e.lon ?? center.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) continue;
    if (!/^(node|way|relation)$/.test(String(e.type)) || !Number.isSafeInteger(e.id) || Number(e.id) <= 0) continue;
    const name = text(tags["name:en"] || tags.name || tags["name:ja"], 300), diet = text(tags["diet:halal"]);
    const mosque = tags.religion === "muslim" && (tags.amenity === "place_of_worship" || tags.building === "mosque");
    const foodType = /^(restaurant|fast_food|cafe|food_court)$/.test(String(tags.amenity)) || /^(supermarket|convenience|butcher|food)$/.test(String(tags.shop));
    const namedHalal = /\bhalal\b|ハラ[ー]?ル/i.test(name) || tags.cuisine === "halal";
    const foodPlace = !mosque && foodType && diet !== "no" && (/^(yes|only|limited)$/.test(diet) || namedHalal);
    if (!mosque && !foodPlace) continue;
    const address = [tags["addr:city"], tags["addr:suburb"], tags["addr:street"], tags["addr:housenumber"]].map(x => text(x, 120)).filter(Boolean).join(" ");
    const website = text(tags.website || tags["contact:website"]);
    result.push({id: e.type + "/" + e.id, kind: mosque ? "mosque" : "food", lat, lng,
      name: name || (mosque ? "মসজিদ / নামাজের জায়গা" : "খাবারের জায়গা"), address,
      evidence: mosque ? "OpenStreetMap-এ মুসলিম নামাজের জায়গা হিসেবে চিহ্নিত" : diet === "limited" ? "কিছু খাবারে halal tag আছে; দোকানে মিলিয়ে নিন" : diet ? "OpenStreetMap-এ halal tag আছে; সনদ যাচাই করুন" : "নামে halal আছে; সনদ যাচাই করুন",
      sourceUrl: "https://www.openstreetmap.org/" + e.type + "/" + e.id,
      website: /^https?:\/\//i.test(website) ? website : "", openingHours: text(tags.opening_hours, 500)
    });
  }
  return result;
}

async function nearby(url: URL): Promise<Response> {
  const latRaw = url.searchParams.get("lat"), lngRaw = url.searchParams.get("lng");
  const lat = Number(latRaw), lng = Number(lngRaw), radius = Number(url.searchParams.get("radius") || 6000);
  if (!latRaw?.trim() || !lngRaw?.trim() || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 85 || Math.abs(lng) > 180 || ![3000, 6000, 10000].includes(radius)) return reply({ok: false, error: "invalid_location"}, 400);
  const gridLat = Number(lat.toFixed(2)), gridLng = Number(lng.toFixed(2));
  const area = `(around:${radius + 1000},${gridLat},${gridLng})`;
  const query = `[out:json][timeout:18];(nwr${area}["amenity"="place_of_worship"]["religion"="muslim"];nwr${area}["building"="mosque"]["religion"="muslim"];nwr${area}["diet:halal"~"^(yes|only|limited)$"];nwr${area}["amenity"~"^(restaurant|fast_food|cafe|food_court)$"]["name"~"halal|ハラール|ハラル",i];nwr${area}["shop"~"^(supermarket|convenience|butcher|food)$"]["name"~"halal|ハラール|ハラル",i];nwr${area}["cuisine"="halal"];);out center tags;`;
  try {
    const places = await cached(`places-v1/${gridLat}/${gridLng}/${radius}`, 86400, async () => {
      for (let i = 0; i < OVERPASS.length; i++) {
        try {
          const data = await fetchJson(OVERPASS[i], {method: "POST", headers: {"Content-Type": "application/x-www-form-urlencoded"}, body: "data=" + encodeURIComponent(query)}, 22000);
          if (text(obj(data).remark)) throw new Error("incomplete_map_response");
          return parsePlaces(data);
        } catch (error) {
          if (error instanceof Error && error.message === "rate_limited") throw error;
          if (i === OVERPASS.length - 1) throw error;
        }
      }
      throw new Error("map_service_unavailable");
    }) as Data[];
    const filtered = places.map(p => ({...p, distance: Math.round(distanceMeters(lat, lng, Number(p.lat), Number(p.lng)))}))
      .filter(p => p.distance <= radius).sort((a, b) => a.distance - b.distance).slice(0, 100);
    return reply({ok: true, source: "OpenStreetMap / Overpass", radius, places: filtered, attribution: "© OpenStreetMap contributors · ODbL"});
  } catch (error) {
    const limited = error instanceof Error && error.message === "rate_limited";
    return reply({ok: false, error: limited ? "rate_limited" : "map_service_unavailable"}, limited ? 429 : 503);
  }
}

export async function handlePublicData(request: Request): Promise<Response> {
  const url = new URL(request.url);
  if (request.method !== "GET") return reply({ok: false, error: "method_not_allowed"}, 405);
  if (url.pathname === "/api/public/food") return food(url);
  if (url.pathname === "/api/public/nearby") return nearby(url);
  return reply({ok: false, error: "not_found"}, 404);
}
