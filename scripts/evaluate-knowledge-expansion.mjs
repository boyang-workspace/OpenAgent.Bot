import { runnerImport } from "vite";

const stage = process.argv[2] ?? "after";
if (!["before", "data-only", "after"].includes(stage)) throw new Error("Usage: node scripts/evaluate-knowledge-expansion.mjs [before|data-only|after]");
const { module } = await runnerImport(new URL("../evaluations/knowledge-expansion.ts", import.meta.url).pathname, { configFile: false, envFile: false, logLevel: "silent" });
const result = await module.evaluateExpansion(stage);
console.log(JSON.stringify(result, null, 2));
if (stage === "after" && result.summary.failed.length) process.exitCode = 1;
