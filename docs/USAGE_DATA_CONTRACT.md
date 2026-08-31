# Public Usage Data Contract

## Product claim

`/usage` reports public traffic observed by a named third-party platform. It is an adoption signal, not total market usage, model quality, spend, request count or unique users.

The default view contains only records whose openness is already verified in the OpenAgent catalogue as `open-source`, `open-weights`, `open-core` or `source-available`. An unmapped name never becomes open through string guessing.

## OpenRouter v1

| Dimension | Endpoint | Stored grain | Coverage |
| --- | --- | --- | --- |
| Models | `/api/v1/datasets/rankings-daily` | UTC day × model permaslug | Daily top 50 public models plus `other` |
| Agents / apps | `/api/v1/datasets/app-rankings` | UTC day × public app ID | Top 200 opt-in public apps queried one completed day at a time |

Both datasets require a valid OpenRouter API key. The key is a Worker secret and never reaches the browser, database or sync response.

Source attribution must use OpenRouter's response `meta.as_of` timestamp and CC BY 4.0 citation. Private models, private endpoints, zero-data-retention traffic and apps that do not opt into attribution are absent.

## Non-combinable metrics

The following remain separate series and must not be added to platform tokens:

- Hugging Face model downloads;
- npm package downloads;
- GitHub stars, forks, commits or releases;
- Replicate run counts;
- another provider's token totals;
- local OpenCode `stats` data.

Provider-native tokenizers differ, so token counts across model families are approximate workload magnitudes. Model variants remain source-level subjects and may be aggregated only after a curated identity rule maps them to the same catalogue record.

## Retention and corrections

Daily rows are upserted at `(subject_id, usage_date)` because the source may correct a recent aggregate. Every row retains `source_as_of` and the observation time. Sync runs record requested dates, row count, mapping coverage, open coverage and errors.

## Operations

- Daily run: previous completed UTC day, models and apps.
- Model backfill: at most 367 days per run.
- App backfill: at most 31 single-day buckets per run to stay below source rate limits.
- Required secret: `OPENROUTER_API_KEY`.
- Internal route: `POST /api/internal/usage-sync.json` authenticated with `SYNC_TOKEN`.
