# Content pack reference

`roadbook.json` is the only display-data source. `meta` controls title, destination, country code, IANA timezone, description and theme. `days` accepts any positive number of entries. A day uses an ISO date, a reusable scene, its own image, optional wake/preparation data, stops, places and segments.

Every place requires a stable id, display name, `[longitude, latitude]`, and navigation query. Set `navigationProvider` to `auto`, `naver`, `amap`, or `google`.

Every segment references place ids. Set `verified: true` only when `routes.geojson` contains a Feature with the same `properties.id`; otherwise the map explicitly renders a dashed illustrative fallback.

`facts.json` always has an explicit `needsRecheck` boolean. `media-manifest.json` records every visible local image and its provenance. The JSON Schema lives at `schemas/roadbook.schema.json`; `npm run validate` additionally enforces cross-file integrity.
