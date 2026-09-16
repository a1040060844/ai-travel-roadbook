#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const roadbook = JSON.parse(readFileSync(path.join(root, "content", "roadbook.json"), "utf8"));
const manifest = {
  name: roadbook.meta.title,
  short_name: roadbook.meta.destination,
  description: roadbook.meta.description ?? `${roadbook.meta.destination} travel roadbook`,
  start_url: "/",
  scope: "/",
  display: "standalone",
  background_color: roadbook.meta.theme.mist,
  theme_color: roadbook.meta.theme.ink,
  icons: [{ src: "/roadbook-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }],
};
mkdirSync(path.join(root, "public"), { recursive: true });
writeFileSync(path.join(root, "public", "manifest.webmanifest"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Prepared manifest for ${roadbook.meta.slug}`);
