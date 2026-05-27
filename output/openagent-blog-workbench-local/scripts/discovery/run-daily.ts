import path from "node:path";
import { collectGitHub } from "./collect-github";
import { collectHackerNews } from "./collect-hackernews";
import { discoveryDirs, discoveryThresholds } from "./constants";
import { enrichCandidates } from "./enrich";
import { formTopics } from "./form-topics";
import { writeJson } from "./io";
import { mergeCandidates, scoreCandidate, todayString } from "./utils";
import { generateDrafts } from "./generate-drafts";

type RunOptions = {
  dryRun: boolean;
  date: string;
};

function parseArgs(argv: string[]): RunOptions {
  const dateIndex = argv.indexOf("--date");
  return {
    dryRun: argv.includes("--dry-run"),
    date: dateIndex >= 0 ? argv[dateIndex + 1] : todayString()
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const now = new Date(`${options.date}T00:00:00.000Z`);

  const collected = [
    ...(await collectGitHub(now)),
    ...(await collectHackerNews(now))
  ];

  const merged = mergeCandidates(collected);
  const enriched = await enrichCandidates(merged, 8);
  const scored = enriched.map(scoreCandidate).sort((a, b) => b.score - a.score);
  const topics = formTopics(scored, options.date);
  const draftCandidates = scored
    .filter((candidate) => candidate.score >= discoveryThresholds.draft)
    .slice(0, discoveryThresholds.maxDailyDrafts);
  const drafts = await generateDrafts(draftCandidates, { dryRun: options.dryRun, generatedAt: now.toISOString() });

  const discoveryPayload = {
    date: options.date,
    dryRun: options.dryRun,
    counts: {
      collected: collected.length,
      merged: merged.length,
      scored: scored.length,
      topics: topics.length,
      drafts: drafts.written.length,
      skippedDrafts: drafts.skipped.length
    },
    candidates: scored
  };

  const topicsPayload = {
    date: options.date,
    topics
  };

  if (!options.dryRun) {
    await writeJson(path.join(discoveryDirs.discovery, `${options.date}.json`), discoveryPayload);
    await writeJson(path.join(discoveryDirs.topics, `${options.date}.json`), topicsPayload);
  }

  console.log(
    [
      `[discovery] ${options.date}${options.dryRun ? " dry-run" : ""}`,
      `collected=${collected.length}`,
      `merged=${merged.length}`,
      `topics=${topics.length}`,
      `drafts=${drafts.written.length}`,
      `skippedDrafts=${drafts.skipped.length}`
    ].join(" ")
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
