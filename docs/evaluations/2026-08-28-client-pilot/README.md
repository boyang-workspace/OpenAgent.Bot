# Real-client retrieval pilot and recorded-history iteration

Decision: **continue a narrow iteration, but pause broad data expansion**. These
four paired tasks do not establish an efficiency advantage: platform input-token
counts and elapsed time were higher in every observed pair. Smaller fact payloads
alone did not offset navigation and source rechecking. One client's small pilot
does not establish that the concept is generally unhelpful either.

Status: local only. No production publication, D1 migration, deployment, robot
execution or project command execution. The preview and correction workflow are
implemented; the real-client evidence below is a small feasibility pilot, not a
success-rate or performance claim for the product.

## What changed

- `npm run knowledge:preview` serves real HTTP over a loopback-only, query-only
  in-memory database. No `.dev.vars`, persistent D1 or source collector is used by
  this preview or experiment. Normal Astro check/build still loads the project's
  usual local configuration; no secret values are included in receipts.
- A test-only stdio MCP proxy exposes one bounded GET tool. The source-only arm
  cannot read Knowledge routes. The platform arm may fall back to the same sources.
- Initial reviewed fact selections now produce `created` events. Explicit
  corrections require the exact prior observation and a public reason, bound to
  the preview hash and written atomically with the new observation. Old evidence
  is retained. Migration 0016 adds immutable correction annotations and a
  transaction-time prior-selection guard; no past events are fabricated.
- A real C1 trial exposed poor navigation. The guide now distinguishes known-project
  fact lookup from discovery search; overview has followable section links and
  field items have `valueUrl`. Invalid project-only searches still fail closed,
  but explain the correct route. No question-specific answer was added to the guide.

## Experiment boundary

The four compound questions and exact structural checks were frozen in
`evaluations/knowledge-client-tasks.json` before the first client run. They concern
Python manifest constraints, Playwright isolation, OpenHands repository ownership
and self-hosted API authentication. These projects were already curated: this is
**not an unseen-project holdout** or a blind independent assessment of curation.

The corpus has 13 official files at pinned commits, with SHA-256 and Git blob
digest verification. All four repository LICENSE files are retained. The baseline
is these original documents through the same reader, **not live web search or a
fully optimized code-search/research system**. The harness never executes document
commands. The full source corpus, task file and individual code/data fingerprints
are available for audit.

A source-only C2 trial timed out while trying unsupported line/search parameters
on a long README. This is a reader limitation, not evidence of platform superiority.
Both arms now get the same bounded literal search and numbered line windows over
unchanged originals. C2 is repeated with that reader; the timeout and pre-reader
platform result remain separate receipts. Each pair's reader/config version must
be respected; do not pool different versions into a single speedup number.

Each trial is a fresh ephemeral Codex CLI session in an empty temporary directory.
Shell, web, apps/plugins/hooks, other agents and non-experiment integrations are
disabled per invocation. The client's code-mode host is needed to route the one
read tool; disabling it was a setup error, not a platform failure. No global
configuration or login state was changed. Skill overrides include both file and
folder paths because the initial folder-only configuration left a skill catalog
visible. Recorded context warnings distinguish those runs.

The CLI version is recorded. The actual default model identifier is not emitted
by this CLI event stream, and is therefore recorded as unknown rather than guessed.
Claude authentication is checked without logging in; it was unavailable. This is
one client, not the proposed two-client validation.

Structural grading checks exact output fields plus cited pinned URLs present in
tool results. It does **not** by itself establish semantic entailment: a URL may
have appeared only in an index. Source/answer review is reported separately.
No raw private-reasoning text is retained; usage counts, tool metadata, HTTP
audits, final answers, warnings and hashes are retained.

## C1: observed improvement, not a net efficiency win

Both arms correctly distinguished declared Python compatibility from runtime
testing. The first platform trial made two invalid project-only searches, read
overviews, then fell back to original manifests: 8 reads versus 3 for the baseline.
After the navigation change it used the field/fact paths directly and no fallback.

| C1 after navigation | Original sources | Platform + optional sources |
| --- | ---: | ---: |
| Correct structured answer and pinned citations | Yes | Yes |
| HTTP reads | 3 | 5 |
| Returned HTTP body bytes | 34,007 | 14,801 |
| Elapsed seconds, including startup/network retries | 40.229 | 50.011 |
| CLI-reported input tokens | 46,921 | 49,503 |
| Cached input tokens | 17,920 | 26,880 |
| Input minus cached input | 29,001 | 22,623 |
| Output tokens | 479 | 610 |

The platform returned 56.5% fewer bytes, but made more requests, consumed more
total input tokens and took longer in this one paired run. Uncached input was
lower, which is not a monetary saving estimate. Do not attribute the entire
before/after token change to navigation: skill configuration also changed.

Receipts: [before navigation](c1-before-navigation.json),
[after navigation](c1-after-navigation.json).

## Completed trials and audit

All four task pairs now have complete saved receipts. Each cell below lists
**sources / platform**; these are individual observations, not estimated averages.

| Task | HTTP reads | HTTP body bytes | Elapsed seconds | Input tokens |
| --- | ---: | ---: | ---: | ---: |
| C1 Python constraints | 3 / 5 | 34,007 / 14,801 | 40.229 / 50.011 | 46,921 / 49,503 |
| C2 isolation and security, improved reader | 10 / 17 | 38,726 / 49,313 | 45.402 / 61.745 | 65,216 / 141,286 |
| C3 SDK repository ownership | 3 / 4 | 25,503 / 9,575 | 36.214 / 42.108 | 42,999 / 46,619 |
| C4 public-mode authentication | 9 / 9 | 19,174 / 27,119 | 37.102 / 50.539 | 55,950 / 78,973 |

C1 and C3 platform paths avoided original-source fallback and reduced returned
bytes. C2 and C4 still rechecked originals after reading facts. The API therefore
added work in these security-sensitive lookups. HTTP audits and tool traces support
this observation; elapsed time also includes repeated WebSocket-to-HTTPS fallback,
so it is not a pure service-latency measurement. Cache-adjusted input and output
counts are retained in [audit.json](audit.json), without converting them to dollars.

The same parent agent reviewed the final answers against pinned original lines;
this review is not independent or blinded. C1 and C4 satisfy the frozen structural
checks in both arms. C2's safety claims are correct in both arms, but the automatic
check wrongly demands exactly `in-memory` for a field the question allows as a
free-form string. C3's ownership facts and caution are supported in both arms; the
platform returns `null` instead of expected `false` for proof of compatibility.
Its explanation correctly states that the evidence does not establish it. That
output-contract caveat remains recorded rather than silently scored away.

Consequently the raw exact checks pass 5/8, but that number is **not a factual
accuracy estimate**. Do not report either 5/8 or a post-hoc 8/8 as product reliability.
The line anchors and per-trial adjudication are preserved in [audit.json](audit.json).

Saved pairs: C2 [sources](c2-after-reader-sources.json) / [platform](c2-after-reader-platform.json),
C3 [sources](c3-sources.json) / [platform](c3-platform.json),
C4 [sources](c4-sources.json) / [platform](c4-platform.json).
The earlier C2 [source timeout](c2-sources.json) and [platform run](c2-platform.json)
remain separate and do not serve as the final paired comparison.

An earlier multi-task run had emitted partial completion summaries but its full
receipt was not saved before the session ended. Those results are excluded from
the comparison and are not reconstructed. C1 receipts survived on disk. The
resumed run supports `--tasks=C2 --arms=platform` so one completed trial can be
saved immediately, without waiting for an entire batch.

Setup errors are preserved separately: [first attempt summary](setup-attempt-1-summary.json),
[second attempt diagnostics](setup-attempt-2.json), [preflight failure](setup-attempt-3.json).
The first two consumed real client usage without retrieving any source; they are
excluded from effectiveness results, not treated as free or successful trials.

## Limits on conclusions

One trial per arm cannot estimate reliability, a latency SLA or a robust average.
Network retries and prompt caching affect measured time and token counts. C1 was
run sequentially; resumed C2–C4 arm pairs may overlap, so latency is descriptive,
not a controlled benchmark across tasks. The new tasks and raw snapshots remain
small and curated. Production Worker/D1 behavior, operational retention/backups,
restore drills, field expiry and scoped runtime test reports remain unvalidated.

The earlier 30-task suite is a deterministic regression suite, not 30 real agents
succeeding. Its saved before/data-only/after receipts remain unchanged. Current
first-seen events and navigation links intentionally change projection hashes and
payload sizes; do not overwrite historical receipts to make them match new code.

## Reproduce

```sh
npm run knowledge:check
npm run knowledge:preview
# Explicit real client usage; prints a JSON receipt for immediate preservation:
npm run knowledge:evaluate:client -- --tasks=C2 --arms=platform
npm test
npm run check
npm run build
```

Client configuration was cross-checked against the local CLI and the official
[Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
and [MCP configuration guide](https://learn.chatgpt.com/docs/extend/mcp?surface=cli).
The preview is not an authenticated public service. Apply migration 0016 only
through a separately authorized deployment workflow; this task did not do so.

## Next iteration and stopping rule

1. Prioritize evidence that can be checked in the fact response: short original
   excerpts, pinned file/line locators and digest scope. A bare source URL often
   makes the consumer reread the document. Do not label a reviewed claim as tested.
2. Reduce multi-project/multi-fact round trips with an explicit bounded batch
   contract. Keep unknown, known-negative and absence-of-test-evidence separate;
   avoid overloaded booleans like the C3 proof field.
3. Then run fresh tasks with the improved original-source reader and two logged-in
   clients. Claude authentication is still missing. Pre-register a criterion such
   as lower end-to-end input cost or time without worse source-supported correctness,
   repeat runs, and include actual cross-version/history tasks. Do not tune on C1–C4
   and call them a new holdout.

If that next controlled pilot still adds retrieval work, keep OpenAgent as a
structured evidence registry and history service rather than treating it as a
general replacement for documentation search. The present test does not validate
robot runtime integration, commercial demand or long-term retention guarantees.

Verification on resumption: 168 tests passed, Astro check inspected 104 files with
zero errors/warnings, the 30 fixed expansion regressions passed, and production
build passed. All validation used local code/test data; production was not changed.
