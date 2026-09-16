# Agent workflow

The confirmation gate is intentional. A good-looking roadbook with unconfirmed transport, dates or operating hours is unsafe.

## 1. Intake

Copy the supplied guide into `content/source-guide.md` unchanged. Record its file, URL or user-supplied attachments in `content/facts.json`.

## 2. Fact review

Create `content/fact-review.md` with: extracted itinerary, contradictions, unclear dates/timezones, facts that may have changed, route segments without geometry, and image requirements. Wait for explicit user approval before editing the active roadbook.

## 3. Build the roadbook

Use `content/roadbook.json` for display data and `content/routes.geojson` for geometry. Assign a reusable scene (`flight`, `driving`, `walking`, `rail`, `ferry`, `sunset`, `nature`, `city`, or `static`) to every day. Select the destination theme from the supplied content rather than retaining a previous destination's language, palette or copy.

## 4. Generate local media

For Codex call native `imagegen`; save the selected outputs into `public/assets/`. Generate scenic images without text, logos or watermarks. Update `content/media-manifest.json` with the prompt, tool, path, role and alt text. Prefer WebP for final production assets; retain only local files whose provenance is recorded.

## 5. Verify

Run `npm run check`, `npm run build`, `npm run test:sites`, then inspect `/`, `/today`, `/journey`, `/day/<id>`, `/map`, and `/guide` at a mobile viewport. Confirm map warnings appear for every unverified segment.
