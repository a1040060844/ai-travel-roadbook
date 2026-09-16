#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packDirs = [path.join(root, "content")];
const examples = path.join(root, "examples");
if (existsSync(examples)) for (const entry of readdirSync(examples, { withFileTypes: true })) if (entry.isDirectory()) packDirs.push(path.join(examples, entry.name));

function replacePaths(value, replacements) {
  if (typeof value === "string") return replacements.get(value) ?? value;
  if (Array.isArray(value)) return value.map((item) => replacePaths(item, replacements));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replacePaths(item, replacements)]));
  return value;
}

let converted = 0;
for (const packDir of packDirs) {
  const mediaPath = path.join(packDir, "media-manifest.json");
  const roadbookPath = path.join(packDir, "roadbook.json");
  if (!existsSync(mediaPath) || !existsSync(roadbookPath)) continue;
  const media = JSON.parse(readFileSync(mediaPath, "utf8"));
  const replacements = new Map();
  for (const asset of media.assets ?? []) {
    if (!asset.path?.endsWith(".png")) continue;
    const source = path.join(root, "public", asset.path.replace(/^\//, ""));
    const destinationPath = asset.path.replace(/\.png$/, ".webp");
    const destination = path.join(root, "public", destinationPath.replace(/^\//, ""));
    if (!existsSync(source)) throw new Error(`Missing declared media asset: ${asset.path}`);
    await sharp(source).webp({ quality: 84, effort: 5 }).toFile(destination);
    rmSync(source);
    replacements.set(asset.path, destinationPath);
    asset.path = destinationPath;
    asset.format = "webp";
    asset.needsOptimization = false;
    converted += 1;
  }
  writeFileSync(mediaPath, `${JSON.stringify(media, null, 2)}\n`);
  const roadbook = JSON.parse(readFileSync(roadbookPath, "utf8"));
  writeFileSync(roadbookPath, `${JSON.stringify(replacePaths(roadbook, replacements), null, 2)}\n`);
}

console.log(`Optimized ${converted} declared local images to WebP.`);
