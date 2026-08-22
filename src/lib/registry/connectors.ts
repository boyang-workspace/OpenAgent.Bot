import { factHash } from "./observations";

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
  observedAt: string;
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
    const license = data.license && typeof data.license === "object"
      ? (data.license as Record<string, unknown>).spdx_id
      : undefined;

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
        language: data.language
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

    return {
      externalId: String(data.id ?? modelId),
      locator: modelId,
      canonicalUrl: `https://huggingface.co/${modelId}`,
      observedAt: new Date().toISOString(),
      facts: {
        model_id: data.modelId ?? data.id,
        pipeline_tag: data.pipeline_tag,
        library_name: data.library_name,
        tags: data.tags,
        gated: data.gated,
        license_spdx: normalizeSpdx(cardData.license)
      },
      metrics: {
        downloads_30d: Number(data.downloads ?? 0),
        likes: Number(data.likes ?? 0),
        last_commit_at: typeof data.lastModified === "string" ? data.lastModified : null
      }
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
  huggingface: huggingFaceConnector
};

export const feedConnectors: Record<string, FeedConnector> = {
  rss: rssConnector
};
