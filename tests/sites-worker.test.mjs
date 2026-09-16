import assert from "node:assert/strict";
import test from "node:test";
import { existsSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
test("Sites handoff keeps required server artifacts", () => {
  assert.ok(existsSync(path.join(root, ".openai", "hosting.json")));
  assert.ok(existsSync(path.join(root, "worker", "index.js")));
  assert.ok(existsSync(path.join(root, "dist", "client", "index.html")));
  assert.ok(existsSync(path.join(root, "dist", "server", "index.js")));
  assert.ok(existsSync(path.join(root, "dist", ".openai", "hosting.json")));
});
