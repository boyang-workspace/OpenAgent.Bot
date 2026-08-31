import { runnerImport } from "vite";

const { module } = await runnerImport(new URL("../evaluations/knowledge-agent-tasks.ts", import.meta.url).pathname, {
  configFile: false, envFile: false, logLevel: "silent"
});
const mode = process.argv[2] ?? "after";
if (!["before", "after"].includes(mode)) throw new Error("Usage: node scripts/evaluate-knowledge.mjs [before|after]");
console.log(JSON.stringify(await module[mode === "before" ? "evaluateBaseline" : "evaluateIteration"](), null, 2));
