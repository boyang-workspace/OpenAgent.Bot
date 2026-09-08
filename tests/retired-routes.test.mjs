import test from "node:test";
import assert from "node:assert/strict";
import worker, { isRetiredDatabasePath } from "../worker.js";

const assets = {
  fetch: async () => new Response("current site", { status: 200 })
};

test("recognizes former database pages without matching current project paths", () => {
  assert.equal(isRetiredDatabasePath("/database"), true);
  assert.equal(isRetiredDatabasePath("/project/opencode/"), true);
  assert.equal(isRetiredDatabasePath("/agents/open-design/"), true);
  assert.equal(isRetiredDatabasePath("/tools/mlflow/"), true);
  assert.equal(isRetiredDatabasePath("/"), false);
  assert.equal(isRetiredDatabasePath("/yup/"), false);
  assert.equal(isRetiredDatabasePath("/moai/"), false);
  assert.equal(isRetiredDatabasePath("/robots.txt"), false);
});

test("returns 410 for retired pages and leaves the portal and YUP untouched", async () => {
  const retired = await worker.fetch(new Request("https://www.openagent.bot/database/"), { ASSETS: assets });
  assert.equal(retired.status, 410);
  assert.equal(retired.headers.get("x-robots-tag"), "noindex, nofollow");

  const portal = await worker.fetch(new Request("https://www.openagent.bot/"), { ASSETS: assets });
  const yup = await worker.fetch(new Request("https://www.openagent.bot/yup/"), { ASSETS: assets });
  assert.equal(portal.status, 200);
  assert.equal(yup.status, 200);
});
