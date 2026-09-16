import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const scenes = new Set(["flight", "driving", "walking", "rail", "ferry", "sunset", "nature", "city", "static"]);
const modes = new Set(["flight", "driving", "walking", "rail", "ferry"]);

function readJson(file) { return JSON.parse(readFileSync(file, "utf8")); }

export function validateContentPack(contentDir) {
  const issues = [];
  const required = ["source-guide.md", "roadbook.json", "routes.geojson", "facts.json", "media-manifest.json"];
  for (const file of required) if (!existsSync(path.join(contentDir, file))) issues.push(`Missing required content file: ${file}`);
  if (issues.length) return issues;
  const pack = readJson(path.join(contentDir, "roadbook.json"));
  const routes = readJson(path.join(contentDir, "routes.geojson"));
  const facts = readJson(path.join(contentDir, "facts.json"));
  const media = readJson(path.join(contentDir, "media-manifest.json"));
  if (pack.schemaVersion !== "1.0") issues.push("roadbook.schemaVersion must be 1.0");
  for (const key of ["slug", "title", "destination", "countryCode", "timezone", "theme"]) if (!pack.meta?.[key]) issues.push(`roadbook.meta.${key} is required`);
  if (!/^[a-z0-9-]+$/.test(pack.meta?.slug ?? "")) issues.push("roadbook.meta.slug must be lowercase kebab-case");
  if (!Array.isArray(pack.days) || pack.days.length === 0) issues.push("roadbook.days must contain at least one day");
  const ids = new Set();
  const routeIds = new Set((routes.features ?? []).map((feature) => feature?.properties?.id));
  for (const day of pack.days ?? []) {
    if (!/^day-[a-z0-9-]+$/.test(day.id ?? "")) issues.push(`Invalid day id: ${day.id}`);
    if (ids.has(day.id)) issues.push(`Duplicate day id: ${day.id}`); ids.add(day.id);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day.date ?? "")) issues.push(`${day.id}: date must be ISO YYYY-MM-DD`);
    if (!scenes.has(day.scene)) issues.push(`${day.id}: unsupported scene ${day.scene}`);
    if (!Array.isArray(day.places) || !day.places.length) issues.push(`${day.id}: requires at least one place`);
    const placeIds = new Set((day.places ?? []).map((place) => place.id));
    for (const place of day.places ?? []) {
      if (!Array.isArray(place.coordinates) || place.coordinates.length !== 2 || !place.coordinates.every(Number.isFinite)) issues.push(`${day.id}/${place.id}: coordinates must be [lng, lat]`);
      if (!place.navigationQuery) issues.push(`${day.id}/${place.id}: navigationQuery is required`);
    }
    for (const segment of day.segments ?? []) {
      if (!modes.has(segment.mode)) issues.push(`${day.id}/${segment.id}: unsupported mode ${segment.mode}`);
      if (!placeIds.has(segment.from) || !placeIds.has(segment.to)) issues.push(`${day.id}/${segment.id}: segment endpoints must reference places`);
      if (segment.verified && !routeIds.has(segment.id)) issues.push(`${day.id}/${segment.id}: verified segment requires GeoJSON geometry`);
    }
  }
  if (!Array.isArray(routes.features)) issues.push("routes.geojson must be a FeatureCollection");
  if (typeof facts.needsRecheck !== "boolean") issues.push("facts.json must explicitly set needsRecheck");
  if (!Array.isArray(media.assets)) issues.push("media-manifest.json must provide an assets array");
  return issues;
}
