import { describe, expect, it } from "vitest";
import { githubConnector, huggingFaceConnector, rssConnector } from "../src/lib/registry/connectors";

describe("registry connectors", () => {
  it("normalizes a GitHub repository response", async () => {
    const fetcher = async () => new Response(JSON.stringify({
      id: 42,
      name: "robot",
      full_name: "open/robot",
      html_url: "https://github.com/open/robot",
      description: "Open robot",
      stargazers_count: 10,
      forks_count: 2,
      subscribers_count: 3,
      open_issues_count: 1,
      pushed_at: "2026-08-20T00:00:00Z",
      license: { spdx_id: "MIT" },
      topics: ["robotics"]
    }), { status: 200, headers: { "content-type": "application/json" } });

    const snapshot = await githubConnector.fetchEntity("https://github.com/open/robot", { fetcher });
    expect(snapshot.locator).toBe("open/robot");
    expect(snapshot.metrics.stars).toBe(10);
    expect(snapshot.facts.license_spdx).toBe("MIT");
  });

  it("reads RSS and Atom-style items", async () => {
    const fetcher = async () => new Response(`<?xml version="1.0"?><rss><channel><item><title>Open robot</title><link>https://example.com/robot</link><pubDate>Thu, 20 Aug 2026 00:00:00 GMT</pubDate><description><![CDATA[Robot update]]></description></item></channel></rss>`);
    const items = await rssConnector.fetchItems("https://example.com/feed", { fetcher });
    expect(items).toHaveLength(1);
    expect(items[0]?.title).toBe("Open robot");
    expect(items[0]?.url).toBe("https://example.com/robot");
  });

  it("normalizes common Hugging Face license identifiers to SPDX casing", async () => {
    const fetcher = async () => new Response(JSON.stringify({
      id: "open/model",
      modelId: "open/model",
      cardData: { license: "mit" },
      downloads: 12,
      likes: 3
    }), { status: 200, headers: { "content-type": "application/json" } });

    const snapshot = await huggingFaceConnector.fetchEntity("open/model", { fetcher });
    expect(snapshot.facts.license_spdx).toBe("MIT");
  });
});
