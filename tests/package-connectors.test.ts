import { describe, expect, it } from "vitest";
import { githubReleasesConnector, npmConnector, npmDownloadWindow } from "../src/lib/registry/package-connectors";
import { officialSources } from "../src/lib/registry/official-sources";
import { entityConnectors } from "../src/lib/registry/connectors";
const release = {id:1,tag_name:"vgpu@0.3.1",name:"vgpu 0.3.1",draft:false,prerelease:false,published_at:"2026-08-26T01:00:00Z",html_url:"https://github.com/vercel-labs/vgpu/releases/tag/vgpu%400.3.1"};
describe("package and release collectors", () => {
  it("registers unique source IDs with usable active connectors", () => {
    expect(new Set(officialSources.map((s) => s.id)).size).toBe(officialSources.length);
    for (const id of ["npm","github-releases"]) {
      const source = officialSources.find((s) => s.id === id)!;
      expect(source.automationStatus).toBe("active"); expect(entityConnectors[source.connector]).toBeDefined();
    }
  });
  it("uses exactly 30 complete UTC days excluding today", () => {
    expect(npmDownloadWindow(new Date("2026-08-28T18:22:00Z"))).toEqual({start:"2026-07-29",end:"2026-08-27"});
    expect(npmDownloadWindow(new Date("2024-03-01T00:00:00Z"))).toEqual({start:"2024-01-31",end:"2024-02-29"});
  });
  it("reads a bounded published release history and never executes project commands", async () => {
    const prerelease = {...release,id:2,tag_name:"vgpu@0.4.0-beta",name:"vgpu beta",prerelease:true,html_url:"https://github.com/vercel-labs/vgpu/releases/tag/vgpu%400.4.0-beta"};
    const result = await githubReleasesConnector.fetchEntity("vercel-labs/vgpu",{fetcher:(async () => Response.json([prerelease,release])) as typeof fetch});
    expect(result.facts["github_release.latest"]).toMatchObject({tag:release.tag_name,publishedAt:release.published_at});
    expect(result.facts["github_release.history"]).toMatchObject({count:2,pageLimit:100});
    expect(result.releases).toHaveLength(2);
    expect(result.releases?.[0]?.channel).toBe("prerelease");
    expect(result.metrics.last_release_at).toBe(release.published_at);
  });
  it("distinguishes no published release from an inaccessible repository", async () => {
    const noRelease = await githubReleasesConnector.fetchEntity("vercel-labs/vgpu",{fetcher:(async () => Response.json([])) as typeof fetch});
    expect(noRelease.facts["github_release.latest"]).toBeUndefined();
    expect(noRelease.facts["github_release.status"]).toContain("No published");
    await expect(githubReleasesConnector.fetchEntity("vercel-labs/vgpu",{fetcher:(async () => new Response("",{status:404})) as typeof fetch})).rejects.toThrow("unavailable");
  });
  it("supports scoped npm packages without forwarding GitHub credentials", async () => {
    const calls: string[] = [];
    const result = await npmConnector.fetchEntity("@scope/pkg",{token:"never-forward",fetcher:(async (input,init) => {
      const url = String(input); calls.push(url);
      expect(new Headers(init?.headers).get("Authorization")).toBeNull();
      return Response.json(url.includes("registry.npmjs.org") ? {name:"@scope/pkg","dist-tags":{latest:"1.0.0"},versions:{"1.0.0":{version:"1.0.0",license:"MIT"}},time:{"1.0.0":"2026-08-01T00:00:00Z"}} : {package:"@scope/pkg",downloads:123,...npmDownloadWindow()});
    }) as typeof fetch});
    expect(calls).toHaveLength(2); expect(calls.every((url) => url.endsWith("%40scope%2Fpkg"))).toBe(true);
    expect(result.metrics).toEqual({npm_downloads_30d:123}); expect(result.facts["npm.package"]).toMatchObject({license:"MIT"});
  });
  it("does not convert unavailable npm stats into zero downloads", async () => {
    await expect(npmConnector.fetchEntity("vgpu",{fetcher:(async () => new Response("",{status:429})) as typeof fetch})).rejects.toThrow("retaining previous");
  });
});
