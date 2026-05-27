import { error, json, readJson, requireAdmin } from "../../_lib/http";
import { getLocalModelSettings, setAppSetting, supportedLocalModels } from "../../_lib/app-settings";
import type { Env } from "../../_lib/types";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  return json({
    ok: true,
    settings: await getLocalModelSettings(env)
  });
};

export const onRequestPatch: PagesFunction<Env> = async ({ request, env }) => {
  const blocked = requireAdmin(request, env);
  if (blocked) return blocked;

  try {
    const input = await readJson(request);
    const defaultModel = typeof input.defaultModel === "string" ? input.defaultModel.trim() : "";
    if (!defaultModel) return error("defaultModel is required.");
    if (![...supportedLocalModels].includes(defaultModel as (typeof supportedLocalModels)[number])) {
      return error("Unsupported local model.");
    }
    await setAppSetting(env, "local_model", { defaultModel });
    return json({
      ok: true,
      settings: await getLocalModelSettings(env)
    });
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Failed to update settings.", 400);
  }
};
