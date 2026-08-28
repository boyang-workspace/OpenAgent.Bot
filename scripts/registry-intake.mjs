import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const value = (flag) => { const i = args.indexOf(flag); return i < 0 ? undefined : args[i + 1]; };
if (args.includes("--help") || !args.length) {
  console.log("Preview: npm run registry:intake -- content/intake/vgpu.json [--url http://127.0.0.1:8976]\nPublish the reviewed preview: add --publish --base-hash HASH --payload-hash HASH --reviewer NAME\nRestore a prior manifest: --revision PUBLICATION_ID (prints the manifest; review and republish it)\nAuthentication: REGISTRY_SYNC_TOKEN environment variable. No automatic publication or command execution.");
  process.exit(0);
}
const token = process.env.REGISTRY_SYNC_TOKEN;
if (!token) throw new Error("Set REGISTRY_SYNC_TOKEN without putting credentials in command arguments");
const origin = new URL(value("--url") ?? "https://www.openagent.bot");
if (origin.username || origin.password || (origin.protocol !== "https:" && !(origin.protocol === "http:" && ["127.0.0.1", "localhost"].includes(origin.hostname)))) throw new Error("Use HTTPS or a loopback development server");
const publicationId = value("--revision"), publish = args.includes("--publish");
const body = publicationId ? { action: "revision", publicationId } : {
  action: publish ? "publish" : "preview", manifest: JSON.parse(readFileSync(args[0], "utf8")),
  baseHash: value("--base-hash"), payloadHash: value("--payload-hash"), reviewer: value("--reviewer")
};
if (publish && (!body.baseHash || !body.payloadHash || !body.reviewer)) throw new Error("Publication requires both hashes from a reviewed preview and a reviewer");
const response = await fetch(new URL("/api/internal/intake.json", origin), {
  method: "POST", redirect: "error", signal: AbortSignal.timeout(30_000),
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Origin: origin.origin },
  body: JSON.stringify(body)
});
const result = await response.json();
console.log(JSON.stringify(result, null, 2));
if (!response.ok) process.exitCode = 1;
