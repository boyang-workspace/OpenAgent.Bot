import { describe, expect, it } from "vitest";
import { buildRegistrySeedSql, loadPublishedResources } from "../scripts/registry/export-seed-sql";
import { inferRegistryPlacement, isRoboticsResource, registryCategories, registryResourceTypes } from "../src/lib/registry/ontology";

describe("registry ontology", () => {
  it("defines physical robots separately from channel bots", () => {
    const robots = registryCategories.find((category) => category.id === "robots");
    const channelBots = registryCategories.find((category) => category.id === "channel-bots");
    const robotType = registryResourceTypes.find((type) => type.id === "robot");
    const channelBotType = registryResourceTypes.find((type) => type.id === "channel_bot");

    expect(robots?.definition.toLowerCase()).toContain("physical");
    expect(robots?.excludes.join(" ")).toContain("chat bots");
    expect(channelBots?.includes.join(" ")).toContain("Telegram");
    expect(robotType?.excludes.join(" ")).toContain("Telegram bots");
    expect(channelBotType?.excludes.join(" ")).toContain("humanoid robots");
  });

  it("remaps current legacy bot records into robotics and channel bot categories", async () => {
    const resources = await loadPublishedResources();
    const legacyBots = resources.filter((resource) => resource.classification.primary_category === "bots");
    const placements = legacyBots.map((resource) => ({ resource, placement: inferRegistryPlacement(resource) }));

    const aira = placements.find(({ resource }) => resource.slug === "aira");
    const genesis = placements.find(({ resource }) => resource.slug === "genesis");
    const astrbot = placements.find(({ resource }) => resource.slug === "astrbot");
    const telegramAgent = placements.find(({ resource }) => resource.slug === "telegram-ai-agent");

    expect(legacyBots.length).toBe(31);
    expect(aira?.placement.category).toBe("robots");
    expect(genesis?.placement.category).toBe("robotics");
    expect(astrbot?.placement.category).toBe("channel-bots");
    expect(telegramAgent?.placement.resourceType).toBe("channel_bot");

    const channelBotCount = placements.filter(({ placement }) => placement.category === "channel-bots").length;
    const roboticsCount = placements.filter(({ placement }) => placement.category === "robots" || placement.category === "robotics").length;

    expect(channelBotCount).toBe(25);
    expect(roboticsCount).toBe(6);
  });

  it("does not treat generic AI tools as robotics records just because their text mentions robots", async () => {
    const resources = await loadPublishedResources();
    const futureAgi = resources.find((resource) => resource.slug === "future-agi");

    expect(futureAgi).toBeDefined();
    expect(futureAgi ? isRoboticsResource(futureAgi) : true).toBe(false);
    expect(futureAgi ? inferRegistryPlacement(futureAgi).category : undefined).toBe("evaluations");
  });

  it("exports ResourceV1 records into registry seed SQL", async () => {
    const resources = await loadPublishedResources();
    const sql = buildRegistrySeedSql(resources, "2026-06-11T00:00:00.000Z");

    expect(sql).toContain("INSERT OR REPLACE INTO registry_resource_types");
    expect(sql).toContain("INSERT OR REPLACE INTO registry_resources");
    expect(sql).toContain("'channel-bots'");
    expect(sql).toContain("'robots'");
    expect(sql).toContain("'robotics'");
    expect(sql).toContain("'astrbot'");
    expect(sql).toContain("'aira'");
    expect(sql).toContain("registry_robot_specs");
    expect(sql).toContain("registry_integrations");
    expect(sql).toMatch(/INSERT OR REPLACE INTO registry_integrations .*'Discord'/);
    expect(sql).not.toMatch(/INSERT OR REPLACE INTO registry_capabilities .*'Discord'/);
    expect(sql).not.toMatch(/INSERT OR REPLACE INTO registry_robot_specs .*'res_future_agi'/);
  });
});
