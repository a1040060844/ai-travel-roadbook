import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { validateContentPack } from "../scripts/roadbook-validation.mjs";

function fixture(days) {
  const dir = mkdtempSync(path.join(tmpdir(), "roadbook-fixture-"));
  const date = (index) => `2027-04-${String(index + 1).padStart(2, "0")}`;
  const data = { schemaVersion: "1.0", meta: { slug: "fixture-trip", title: "Fixture", destination: "Test", countryCode: "US", timezone: "UTC", theme: { accent: "#000", ink: "#111", mist: "#fff", heroImage: "/hero.webp" } }, days: Array.from({ length: days }, (_, index) => ({ id: `day-${index + 1}`, date: date(index), label: `DAY ${index + 1}`, title: "Test", scene: "walking", image: "/day.webp", stops: [], places: [{ id: "a", name: "A", coordinates: [index, index], navigationQuery: "A" }], segments: [] })), guide: {} };
  writeFileSync(path.join(dir, "source-guide.md"), "source");
  writeFileSync(path.join(dir, "roadbook.json"), JSON.stringify(data));
  writeFileSync(path.join(dir, "routes.geojson"), JSON.stringify({ type: "FeatureCollection", features: [] }));
  writeFileSync(path.join(dir, "facts.json"), JSON.stringify({ needsRecheck: true, records: [] }));
  writeFileSync(path.join(dir, "media-manifest.json"), JSON.stringify({ assets: [] }));
  return dir;
}

for (const length of [1, 5, 12]) test(`${length}-day roadbook validates`, () => {
  const dir = fixture(length);
  try { assert.deepEqual(validateContentPack(dir), []); } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("verified route must have geometry", () => {
  const dir = fixture(1);
  try {
    const file = path.join(dir, "roadbook.json"); const data = JSON.parse(readFileSync(file, "utf8"));
    data.days[0].segments = [{ id: "missing", from: "a", to: "a", mode: "walking", verified: true }]; writeFileSync(file, JSON.stringify(data));
    assert.match(validateContentPack(dir).join("\n"), /requires GeoJSON geometry/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("the published Jeju example validates as a reusable content pack", () => {
  assert.deepEqual(validateContentPack("examples/jeju-complete"), []);
});
