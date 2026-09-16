#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nameFlag = process.argv.indexOf("--example");
const example = nameFlag >= 0 ? process.argv[nameFlag + 1] : "";
if (!example) throw new Error("Usage: npm run roadbook:use -- --example <name>");
const source = path.join(root, "examples", example);
if (!existsSync(source)) throw new Error(`Unknown example: ${example}`);
const target = path.join(root, "content");
mkdirSync(target, { recursive: true });
for (const file of ["source-guide.md", "roadbook.json", "routes.geojson", "facts.json", "media-manifest.json"]) cpSync(path.join(source, file), path.join(target, file));
console.log(`Loaded ${example} into content/. This replaces the active content pack only.`);
