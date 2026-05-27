import type { Env } from "./types";
import { defaultLocalModel } from "./local-model";

export const supportedLocalModels = ["qwen3.5:9b", "gemma4:e4b", "qwen3.5:4b", "qwen3.5:2b"] as const;

type AppSettingRow = {
  key: string;
  value_json: string;
  updated_at: string;
};

export async function getAppSetting<T>(env: Env, key: string): Promise<T | undefined> {
  const row = await env.DB.prepare("SELECT * FROM app_settings WHERE key = ?").bind(key).first<AppSettingRow>();
  if (!row?.value_json) return undefined;
  return JSON.parse(row.value_json) as T;
}

export async function setAppSetting(env: Env, key: string, value: unknown): Promise<void> {
  await env.DB.prepare(
    "INSERT OR REPLACE INTO app_settings (key, value_json, updated_at) VALUES (?, ?, ?)"
  )
    .bind(key, JSON.stringify(value), new Date().toISOString())
    .run();
}

export async function listAvailableLocalModels(env: Env): Promise<string[]> {
  try {
    const response = await fetch(`${(env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434").replace(/\/+$/, "")}/api/tags`);
    if (!response.ok) return [];
    const data = (await response.json()) as { models?: Array<{ name?: string }> };
    return [...new Set((data.models ?? []).map((item) => item.name?.trim()).filter((name): name is string => Boolean(name)))];
  } catch {
    return [];
  }
}

export async function getConfiguredLocalModel(env: Env): Promise<string> {
  const setting = await getAppSetting<{ defaultModel?: string }>(env, "local_model");
  const configured = setting?.defaultModel?.trim();
  return configured || defaultLocalModel(env);
}

export async function getLocalModelSettings(env: Env) {
  const available = await listAvailableLocalModels(env);
  const configured = await getConfiguredLocalModel(env);
  return {
    defaultModel: configured,
    availableModels: available,
    supportedModels: [...supportedLocalModels]
  };
}
