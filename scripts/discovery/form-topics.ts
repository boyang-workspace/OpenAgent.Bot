import type { TopicCandidate } from "../../src/lib/content/schema";
import { discoveryThresholds } from "./constants";
import type { ScoredCandidate } from "./utils";
import { slugify } from "./utils";

export function formTopics(candidates: ScoredCandidate[], date: string): TopicCandidate[] {
  return candidates
    .filter((candidate) => candidate.score >= discoveryThresholds.candidate)
    .sort((a, b) => b.score - a.score)
    .map((candidate) => ({
      id: `${date}:${slugify(candidate.title)}`,
      candidateIds: [candidate.id],
      topicType: "single-project",
      title: `Profile ${candidate.title}`,
      angle: `Explain what ${candidate.title} does, who it is for, and whether it is a useful open AI resource.`,
      targetKeyword: `${candidate.title} open source ${candidate.category.replace("-", " ")}`,
      reason: candidate.reasons.join("; ") || "Matched open AI discovery signals.",
      score: candidate.score,
      status: candidate.score >= discoveryThresholds.draft ? "drafted" : "new"
    }));
}
