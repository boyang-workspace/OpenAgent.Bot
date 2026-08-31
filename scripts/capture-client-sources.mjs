// Explicitly invoked, read-only network capture. Prints a corpus for review;
// never edits a manifest or publishes data. Every file must match its prior blob.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const inventory = JSON.parse(readFileSync("docs/evaluations/2026-08-28-expansion/sources.json", "utf8")).sources;
const projects = { "OpenHands/OpenHands": "openhands", "langchain-ai/langgraph": "langgraph", "huggingface/lerobot": "lerobot", "microsoft/playwright-mcp": "playwright-mcp" };
const paths = { "README.md": "readme", "LICENSE": "license", "pyproject.toml": "package", "libs/langgraph/pyproject.toml": "package", "package.json": "package", "docs/SELF_HOSTING.md": "self-hosting", "src/lerobot/scripts/lerobot_teleoperate.py": "teleoperation" };
const selected = inventory.filter(item => projects[item.repo] && paths[item.path]);
const sources = [];
for (const item of selected) {
  if (!/^[a-f0-9]{40}$/.test(item.ref)) throw new Error("Unpinned source");
  const response = await fetch(`https://raw.githubusercontent.com/${item.repo}/${item.ref}/${item.path}`, { redirect: "error", signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`Source unavailable: ${item.repo}/${item.path} (${response.status})`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > 256 * 1024 || bytes.length !== item.size) throw new Error("Unexpected source size");
  const blob = createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
  if (blob !== item.sha) throw new Error("Source hash mismatch");
  const project = projects[item.repo];
  sources.push({ id: `${project}-${paths[item.path]}`, project, url: `https://github.com/${item.repo}/blob/${item.ref}/${item.path}`, capturedAt: new Date().toISOString(), gitBlobSha: blob, sha256: createHash("sha256").update(bytes).digest("hex"), text: bytes.toString("utf8") });
}
console.log(JSON.stringify({ scope: "Four licensed source repositories; repository LICENSE snapshots retained. Same pinned source versions as the reviewed intake. Not a live-web benchmark or permanent archive guarantee.", sources }, null, 2));
