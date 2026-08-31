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

  it("prefers an explicit code license over a repository-level content license", async () => {
    const mit = "MIT License\n\nPermission is hereby granted, free of charge, to any person obtaining a copy";
    const fetcher = async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/repos/microsoft/autogen")) return new Response(JSON.stringify({
        id: 680120071, name: "autogen", full_name: "microsoft/autogen",
        html_url: "https://github.com/microsoft/autogen", license: { spdx_id: "CC-BY-4.0" }
      }), { status: 200, headers: { "content-type": "application/json" } });
      if (url.endsWith("/repos/microsoft/autogen/contents")) return new Response(JSON.stringify([
        { name: "LICENSE", url: "https://api.github.com/repos/microsoft/autogen/contents/LICENSE" },
        { name: "LICENSE-CODE", url: "https://api.github.com/repos/microsoft/autogen/contents/LICENSE-CODE" }
      ]), { status: 200, headers: { "content-type": "application/json" } });
      return new Response(JSON.stringify({ encoding: "base64", content: btoa(mit) }), {
        status: 200, headers: { "content-type": "application/json" }
      });
    };

    const snapshot = await githubConnector.fetchEntity("microsoft/autogen", { fetcher });
    expect(snapshot.facts.license_spdx).toBe("MIT");
  });

  it("falls back to an unambiguous root license when GitHub cannot classify it", async () => {
    const apache = "Apache License\nVersion 2.0, January 2004\nhttp://www.apache.org/licenses/";
    const fetcher = async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/repos/MemoriLabs/Memori")) return new Response(JSON.stringify({
        id: 1025381911, name: "Memori", full_name: "MemoriLabs/Memori",
        html_url: "https://github.com/MemoriLabs/Memori", license: { spdx_id: "NOASSERTION" }
      }), { status: 200, headers: { "content-type": "application/json" } });
      if (url.endsWith("/repos/MemoriLabs/Memori/contents")) return new Response(JSON.stringify([
        { name: "LICENSE", url: "https://api.github.com/repos/MemoriLabs/Memori/contents/LICENSE" }
      ]), { status: 200, headers: { "content-type": "application/json" } });
      return new Response(JSON.stringify({ encoding: "base64", content: btoa(apache) }), {
        status: 200, headers: { "content-type": "application/json" }
      });
    };

    const snapshot = await githubConnector.fetchEntity("MemoriLabs/Memori", { fetcher });
    expect(snapshot.facts.license_spdx).toBe("Apache-2.0");
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
