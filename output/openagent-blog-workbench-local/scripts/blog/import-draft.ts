import { readFile } from "node:fs/promises";
import { parseBlogDraftInput, qualityGateBlogDraft } from "../../src/lib/content/blog-automation";

type Options = {
  file?: string;
  importUrl?: string;
  dryRun: boolean;
};

function parseArgs(argv: string[]): Options {
  const valueAfter = (flag: string) => {
    const index = argv.indexOf(flag);
    return index >= 0 ? argv[index + 1] : undefined;
  };
  return {
    file: valueAfter("--file"),
    importUrl: valueAfter("--import-url") ?? process.env.OPENAGENT_BLOG_IMPORT_URL,
    dryRun: argv.includes("--dry-run")
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options.file) throw new Error("--file is required.");
  const raw = await readFile(options.file, "utf8");
  const draft = parseBlogDraftInput(JSON.parse(raw));
  const qualityReport = qualityGateBlogDraft(draft);
  if (!qualityReport.passed) throw new Error(`Blog draft failed quality gate: ${qualityReport.issues.join(" ")}`);
  if (options.dryRun) {
    console.log(JSON.stringify({ draft, qualityReport }, null, 2));
    return;
  }
  if (!options.importUrl) throw new Error("Set OPENAGENT_BLOG_IMPORT_URL or pass --import-url.");

  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-openagent-actor": "codex"
  };
  if (process.env.CF_ACCESS_CLIENT_ID && process.env.CF_ACCESS_CLIENT_SECRET) {
    headers["CF-Access-Client-Id"] = process.env.CF_ACCESS_CLIENT_ID;
    headers["CF-Access-Client-Secret"] = process.env.CF_ACCESS_CLIENT_SECRET;
  }
  const response = await fetch(options.importUrl, { method: "POST", headers, body: JSON.stringify(draft) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) throw new Error(result.error ?? `Import failed with ${response.status}.`);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
