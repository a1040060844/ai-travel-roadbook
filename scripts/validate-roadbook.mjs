#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateContentPack } from "./roadbook-validation.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentFlag = process.argv.indexOf("--content");
const contentDir = contentFlag >= 0 ? path.resolve(process.argv[contentFlag + 1]) : path.join(root, "content");
const issues = validateContentPack(contentDir);
if (issues.length) {
  console.error(`Roadbook validation failed for ${contentDir}:`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}
console.log(`Roadbook validation passed: ${contentDir}`);
