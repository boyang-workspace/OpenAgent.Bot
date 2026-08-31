import { factHash } from "./observations";
import { githubReleasesConnector, npmConnector } from "./package-connectors";

export type ConnectorContext = {
  token?: string;
  fetcher?: typeof fetch;
};

export type EntitySnapshot = {
  externalId: string;
  locator: string;
  canonicalUrl: string;
  facts: Record<string, unknown>;
  metrics: Record<string, number | string | null>;
  releases?: ReleaseSnapshot[];
  papers?: PaperSnapshot[];
  evaluations?: EvaluationSnapshot[];
  observedAt: string;
};

export type ReleaseSnapshot = {
  upstreamId?: string;
  version?: string;
  title: string;
  url: string;
  publishedAt?: string;
  channel: "stable" | "prerelease" | "development" | "unknown";
  notes?: string;
  metadata?: Record<string, unknown>;
};

export type PaperSnapshot = {
  title: string;
  url: string;
  arxivId?: string;
  doi?: string;
  publishedAt?: string;
  relationshipType: "introduces" | "evaluates" | "uses" | "extends" | "documents" | "other";
  sourceUrl: string;
  metadata?: Record<string, unknown>;
};

export type EvaluationSnapshot = {
  benchmarkSlug: string;
  benchmarkName: string;
  task?: string;
  metricKey: string;
  metricValue?: number;
  metricText?: string;
  unit?: string;
  higherIsBetter?: boolean;
  evaluatorType: "official" | "third-party" | "community" | "unknown";
  resultUrl: string;
  evaluatedAt?: string;
  conditions?: Record<string, unknown>;
};

export type SourceItemSnapshot = {
  externalId?: string;
  title: string;
  summary?: string;
  url: string;
  publishedAt?: string;
  topics: string[];
  rawHash: string;
};

export interface EntityConnector {
  id: string;
  fetchEntity(locator: string, context?: ConnectorContext): Promise<EntitySnapshot>;
}

export interface FeedConnector {
  id: string;
  fetchItems(url: string, context?: ConnectorContext): Promise<SourceItemSnapshot[]>;
}

function requestHeaders(token?: string): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    "User-Agent": "OpenAgentBot-Registry/2.0",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

const openCodeSpdx = new Set([
  "0BSD", "AGPL-3.0", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause",
  "GPL-2.0", "GPL-3.0", "ISC", "LGPL-2.1", "LGPL-3.0", "MIT",
  "MPL-2.0", "Unlicense"
]);
const codeLicenseFile = /^(?:license|copying)[-_.]?code(?:\.[a-z0-9]+)?$|^code[-_.]?(?:license|copying)(?:\.[a-z0-9]+)?$/i;
const rootLicenseFile = /^(?:license|copying)(?:\.[a-z0-9]+)?$/i;

function detectCodeLicense(value: string): string | undefined {
  const text = value.replace(/\s+/g, " ").trim();
  if (/licensing transition|Portions of this software are licensed as follows|Enterprise License/i.test(text)) return undefined;
  if (/MIT License/i.test(text) && /Permission is hereby granted, free of charge/i.test(text)) return "MIT";
  if (/Apache License,? Version 2\.0/i.test(text)) return "Apache-2.0";
  if (/GNU AFFERO GENERAL PUBLIC LICENSE/i.test(text) && /Version 3/i.test(text)) return "AGPL-3.0";
  if (/GNU GENERAL PUBLIC LICENSE/i.test(text) && /Version 3/i.test(text)) return "GPL-3.0";
  if (/Mozilla Public License Version 2\.0/i.test(text)) return "MPL-2.0";
  return undefined;
}

async function scopedGitHubCodeLicense(
  repo: string,
  repositoryLicense: unknown,
  fetcher: typeof fetch,
  headers: HeadersInit
): Promise<unknown> {
  if (typeof repositoryLicense === "string" && openCodeSpdx.has(repositoryLicense)) return repositoryLicense;
  const contents = await fetcher(`https://api.github.com/repos/${repo}/contents`, { headers });
  if (!contents.ok) return repositoryLicense;
  const entries = await contents.json() as Array<Record<string, unknown>>;
  const entry = entries.find((item) => codeLicenseFile.test(String(item.name ?? "")))
    ?? entries.find((item) => rootLicenseFile.test(String(item.name ?? "")));
  if (!entry?.url) return repositoryLicense;
  const response = await fetcher(String(entry.url), { headers });
  if (!response.ok) return repositoryLicense;
  const payload = await response.json() as Record<string, unknown>;
  if (payload.encoding !== "base64" || typeof payload.content !== "string") return repositoryLicense;
  return detectCodeLicense(atob(payload.content.replaceAll("\n", ""))) ?? repositoryLicense;
}

function normalizeSpdx(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const canonical = new Map([
    ["mit", "MIT"],
    ["apache-2.0", "Apache-2.0"],
    ["bsd-3-clause", "BSD-3-Clause"],
    ["bsd-2-clause", "BSD-2-Clause"],
    ["mpl-2.0", "MPL-2.0"],
    ["gpl-3.0", "GPL-3.0"],
    ["agpl-3.0", "AGPL-3.0"]
  ]);
  return canonical.get(value.trim().toLowerCase()) ?? value;
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : value === undefined || value === null ? [] : [value];
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100) || "unknown";
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function modelCardEvaluations(cardData: Record<string, unknown>, resultUrl: string): EvaluationSnapshot[] {
  const output: EvaluationSnapshot[] = [];
  for (const model of array(cardData["model-index"])) {
    if (!model || typeof model !== "object" || Array.isArray(model)) continue;
    for (const result of array((model as Record<string, unknown>).results)) {
      if (!result || typeof result !== "object" || Array.isArray(result)) continue;
      const row = result as Record<string, unknown>;
      const task = row.task && typeof row.task === "object" ? row.task as Record<string, unknown> : {};
      const dataset = row.dataset && typeof row.dataset === "object" ? row.dataset as Record<string, unknown> : {};
      const benchmarkName = text(dataset.name) ?? text(dataset.type) ?? "Model card evaluation";
      for (const metric of array(row.metrics)) {
        if (!metric || typeof metric !== "object" || Array.isArray(metric)) continue;
        const item = metric as Record<string, unknown>;
        const metricKey = text(item.type) ?? text(item.name);
        if (!metricKey) continue;
        const numeric = typeof item.value === "number" && Number.isFinite(item.value) ? item.value : undefined;
        const textual = numeric === undefined && item.value !== undefined ? String(item.value) : undefined;
        if (numeric === undefined && textual === undefined) continue;
        output.push({
          benchmarkSlug: `hf-${slug(text(dataset.type) ?? benchmarkName)}`,
          benchmarkName,
          task: text(task.name) ?? text(task.type),
          metricKey,
          metricValue: numeric,
          metricText: textual,
          evaluatorType: "official",
          resultUrl,
          conditions: {
            datasetConfig: dataset.config ?? null,
            datasetSplit: dataset.split ?? null,
            metricConfig: item.config ?? null,
            source: row.source ?? null
          }
        });
      }
    }
  }
  return output;
}

function arxivIds(data: Record<string, unknown>, cardData: Record<string, unknown>): string[] {
  const tags = [...array(data.tags), ...array(cardData.tags)].filter((value): value is string => typeof value === "string");
  const ids = tags.filter((value) => value.toLowerCase().startsWith("arxiv:")).map((value) => value.slice(6));
  for (const value of array(cardData.arxiv)) if (typeof value === "string") ids.push(value.replace(/^arxiv:/i, ""));
  return [...new Set(ids.map((value) => value.trim()).filter((value) => /^\d{4}\.\d{4,5}(v\d+)?$/.test(value)))];
}

async function resolveArxiv(ids: string[], fetcher: typeof fetch, sourceUrl: string): Promise<PaperSnapshot[]> {
  if (!ids.length) return [];
  const fallback = () => ids.map((id) => ({ title: `arXiv ${id}`, url: `https://arxiv.org/abs/${id}`, arxivId: id, relationshipType: "introduces" as const, sourceUrl }));
  try {
    const response = await fetcher(`https://export.arxiv.org/api/query?id_list=${encodeURIComponent(ids.join(","))}`, {
      headers: { "User-Agent": "OpenAgentBot-Registry/2.0" }, signal: AbortSignal.timeout(15_000)
    });
    if (!response.ok) return fallback();
    const xml = await response.text();
    const papers: PaperSnapshot[] = [];
    for (const entry of xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? []) {
      const id = entry.match(/<id>https?:\/\/arxiv\.org\/abs\/([^<]+)<\/id>/)?.[1]?.trim();
      const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/\s+/g, " ").trim();
      const publishedAt = entry.match(/<published>([^<]+)<\/published>/)?.[1]?.trim();
      if (id) papers.push({ title: title ?? `arXiv ${id}`, url: `https://arxiv.org/abs/${id}`, arxivId: id, publishedAt, relationshipType: "introduces", sourceUrl });
    }
    return papers.length ? papers : fallback();
  } catch {
    return fallback();
  }
}

export const githubConnector: EntityConnector = {
  id: "github",
  async fetchEntity(locator, context = {}) {
    const fetcher = context.fetcher ?? fetch;
    const repo = locator.replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, "");
    const response = await fetcher(`https://api.github.com/repos/${repo}`, {
      headers: requestHeaders(context.token)
    });
    if (!response.ok) throw new Error(`GitHub ${response.status} for ${repo}`);
    const data = await response.json() as Record<string, unknown>;
    const repositoryLicense = data.license && typeof data.license === "object"
      ? (data.license as Record<string, unknown>).spdx_id
      : undefined;
    const license = await scopedGitHubCodeLicense(repo, repositoryLicense, fetcher, requestHeaders(context.token));

    return {
      externalId: String(data.id),
      locator: repo,
      canonicalUrl: String(data.html_url),
      observedAt: new Date().toISOString(),
      facts: {
        name: data.name,
        full_name: data.full_name,
        description: data.description,
        homepage: data.homepage,
        license_spdx: license,
        default_branch: data.default_branch,
        archived: data.archived,
        disabled: data.disabled,
        topics: data.topics,
        language: data.language,
        owner: data.owner && typeof data.owner === "object" ? {
          login: (data.owner as Record<string, unknown>).login,
          type: (data.owner as Record<string, unknown>).type,
          url: (data.owner as Record<string, unknown>).html_url
        } : undefined,
        repository_created_at: data.created_at,
        repository_updated_at: data.updated_at,
        repository_pushed_at: data.pushed_at,
        repository_size_kb: data.size,
        has_discussions: data.has_discussions,
        has_wiki: data.has_wiki
      },
      metrics: {
        stars: Number(data.stargazers_count ?? 0),
        forks: Number(data.forks_count ?? 0),
        watchers: Number(data.subscribers_count ?? 0),
        open_issues: Number(data.open_issues_count ?? 0),
        last_commit_at: typeof data.pushed_at === "string" ? data.pushed_at : null
      }
    };
  }
};

export const huggingFaceConnector: EntityConnector = {
  id: "huggingface",
  async fetchEntity(locator, context = {}) {
    const fetcher = context.fetcher ?? fetch;
    const modelId = locator.replace(/^https?:\/\/huggingface\.co\//, "").replace(/\/$/, "");
    const response = await fetcher(`https://huggingface.co/api/models/${modelId}`, {
      headers: { "User-Agent": "OpenAgentBot-Registry/2.0" }
    });
    if (!response.ok) throw new Error(`Hugging Face ${response.status} for ${modelId}`);
    const data = await response.json() as Record<string, unknown>;
    const cardData = data.cardData && typeof data.cardData === "object"
      ? data.cardData as Record<string, unknown>
      : {};

    const sourceUrl = `https://huggingface.co/${modelId}`;
    const papers = await resolveArxiv(arxivIds(data, cardData), fetcher, sourceUrl);
    const evaluations = modelCardEvaluations(cardData, sourceUrl);

    return {
      externalId: String(data.id ?? modelId),
      locator: modelId,
      canonicalUrl: sourceUrl,
      observedAt: new Date().toISOString(),
      facts: {
        model_id: data.modelId ?? data.id,
        pipeline_tag: data.pipeline_tag,
        library_name: data.library_name,
        tags: data.tags,
        gated: data.gated,
        license_spdx: normalizeSpdx(cardData.license),
        base_model: cardData.base_model,
        datasets: cardData.datasets,
        languages: cardData.language,
        model_card_evaluation_count: evaluations.length,
        arxiv_ids: papers.map((paper) => paper.arxivId).filter(Boolean),
        model_card: {
          modelName: cardData.model_name ?? null,
          licenseName: cardData.license_name ?? null,
          licenseLink: cardData.license_link ?? null,
          metrics: cardData.metrics ?? null,
          newVersion: cardData.new_version ?? null
        }
      },
      metrics: {
        downloads_30d: Number(data.downloads ?? 0),
        likes: Number(data.likes ?? 0),
        last_commit_at: typeof data.lastModified === "string" ? data.lastModified : null
      },
      papers,
      evaluations
    };
  }
};

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function tag(block: string, names: string[]): string | undefined {
  for (const name of names) {
    const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
    if (match?.[1]) return decodeXml(match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
  }
  return undefined;
}

export const rssConnector: FeedConnector = {
  id: "rss",
  async fetchItems(url, context = {}) {
    const fetcher = context.fetcher ?? fetch;
    const response = await fetcher(url, { headers: { "User-Agent": "OpenAgentBot-Registry/2.0" } });
    if (!response.ok) throw new Error(`Feed ${response.status} for ${url}`);
    const xml = await response.text();
    const blocks = xml.match(/<(?:item|entry)(?:\s[^>]*)?>[\s\S]*?<\/(?:item|entry)>/gi) ?? [];

    return Promise.all(blocks.slice(0, 100).map(async (block) => {
      const title = tag(block, ["title"]) ?? "Untitled update";
      const linkAttribute = block.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1];
      const itemUrl = tag(block, ["link", "guid", "id"]) ?? linkAttribute ?? url;
      const publishedAt = tag(block, ["pubDate", "published", "updated"]);
      const summary = tag(block, ["description", "summary", "content:encoded"]);
      return {
        externalId: tag(block, ["guid", "id"]),
        title,
        summary,
        url: itemUrl,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
        topics: [],
        rawHash: await factHash(block)
      };
    }));
  }
};

export const entityConnectors: Record<string, EntityConnector> = {
  github: githubConnector,
  "github-releases": githubReleasesConnector,
  npm: npmConnector,
  huggingface: huggingFaceConnector
};

export const feedConnectors: Record<string, FeedConnector> = {
  rss: rssConnector
};
