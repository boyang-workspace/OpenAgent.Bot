import { runnerImport } from "vite";
import { existsSync } from "node:fs";

const args = process.argv.slice(2);
if (args.length > 1 || args.some(arg => !/^--port=\d+$/.test(arg))) throw new Error("Usage: node scripts/knowledge-preview.mjs [--port=8789]");
const port = Number(args[0]?.slice(7) ?? 0);
if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error("Invalid port");
const { module } = await runnerImport(new URL("../evaluations/knowledge-preview.ts", import.meta.url).pathname, { configFile: false, envFile: false, logLevel: "silent" });
const corpus = "evaluations/fixtures/client-source-snapshots.json";
const preview = await module.startKnowledgePreview({ port, sources: existsSync(corpus) ? module.loadSourceSnapshots(corpus) : [] });
console.log(JSON.stringify({ origin: preview.origin, guide: `${preview.origin}/llms.txt`, database: "isolated-in-memory", readOnly: true, note: "Loopback only. No .dev.vars, D1 connection, ingestion endpoints or executable project commands." }));
for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, async () => { await preview.close(); process.exit(0); });
