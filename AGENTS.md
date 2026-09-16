# AI Travel Roadbook Agent Contract

This repository produces **one independent roadbook per trip**. It is not a portal for multiple trips.

## Required workflow

1. Read `content/source-guide.md` as immutable source material.
2. Extract dates, timezone, places, transport, opening constraints, booking requirements, route assumptions and contradictions into `content/fact-review.md`.
3. Mark every uncertain fact as `needs_recheck` in `content/facts.json` and stop for user confirmation.
4. Only after confirmation, update `content/roadbook.json`, `content/routes.geojson`, `content/facts.json`, and `content/media-manifest.json`.
5. Generate one local hero image and one local day image per day. Codex must use its native `imagegen` tool. Other agents may use their available image tool. If no image tool exists, ask the user for assets; never hotlink or invent an asset source.
6. Save source images locally, optimize final images to WebP when an optimizer is available, retain prompt/tool metadata, then run `npm run check && npm run build` and open a local preview.

## Content and map rules

- Do not edit `content/source-guide.md` after intake.
- Use ISO dates and the destination IANA timezone; Today selects only the trip day from that timezone's date.
- Select navigation automatically: `KR` → Naver Map, `CN` → Amap, all others → Google Maps. Per-place override is allowed.
- Verified ground routes require corresponding `content/routes.geojson` geometry and show as solid lines.
- Missing or unverified geometry is permitted only as a visibly dashed straight-line fallback with the warning “路线未验证，仅供示意”. Flight and ferry are clearly labelled travel arcs, not roads.
- Do not claim realtime, traffic, weather or opening-hours information unless an actual source is configured.

## Repository safety

- Never commit secrets, server credentials, deployment IPs, third-party image hotlinks or unlicensed media.
- Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact.
- Before any Sites handoff run `npm run build` and `npm run test:sites`.
