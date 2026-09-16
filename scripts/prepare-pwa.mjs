#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const client = path.join(root, "dist", "client");
if (!existsSync(client)) throw new Error("Missing Vite client build: dist/client");
const roadbook = JSON.parse(readFileSync(path.join(root, "content", "roadbook.json"), "utf8"));
function walk(dir, prefix = "") { return readdirSync(dir).flatMap((name) => { const absolute = path.join(dir, name); const relative = path.posix.join(prefix, name); return statSync(absolute).isDirectory() ? walk(absolute, relative) : [relative]; }); }
const core = walk(client).filter((file) => file === "index.html" || file === "manifest.webmanifest" || file === "roadbook-icon.svg" || file.startsWith("assets/") || file.startsWith("vendor/"));
const urls = core.map((file) => file === "index.html" ? "/" : `/${file}`);
const revision = createHash("sha256").update(core.map((file) => `${file}:${createHash("sha1").update(readFileSync(path.join(client, file))).digest("hex")}`).join("|")).digest("hex").slice(0, 12);
const prefix = `${roadbook.meta.slug}-roadbook-`;
const worker = `const PREFIX=${JSON.stringify(prefix)};const PRECACHE=${JSON.stringify(`${prefix}precache-${revision}`)};const RUNTIME=${JSON.stringify(`${prefix}runtime-${revision}`)};const CORE=${JSON.stringify(urls)};self.addEventListener("install",e=>e.waitUntil(caches.open(PRECACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==PRECACHE&&key!==RUNTIME).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);if(u.hostname==="tile.openstreetmap.org"||u.origin!==self.location.origin)return;if(r.mode==="navigate"){e.respondWith(fetch(r).catch(()=>caches.open(PRECACHE).then(c=>c.match("/")||Response.error())));return}if(!["script","style","image","font"].includes(r.destination)&&u.pathname!=="/manifest.webmanifest")return;e.respondWith(caches.match(r).then(async hit=>{if(hit)return hit;const response=await fetch(r);if(response.ok)(await caches.open(RUNTIME)).put(r,response.clone());return response}))});`;
writeFileSync(path.join(client, "sw.js"), worker);
console.log(`Prepared dynamic PWA cache for ${roadbook.meta.slug} (${urls.length} assets)`);
