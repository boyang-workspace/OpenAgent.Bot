import type { Env } from "./types";

export type LocalModelResult<T = unknown> = {
  provider: "ollama";
  model: string;
  prompt: string;
  systemPrompt?: string;
  rawText: string;
  parsed?: T;
};

type OllamaGenerateResponse = {
  response: string;
  done: boolean;
};

function baseUrl(env: Env): string {
  return (env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434").replace(/\/+$/, "");
}

export function defaultLocalModel(env: Env): string {
  return env.OLLAMA_DEFAULT_MODEL ?? "qwen3.5:9b";
}

export async function runLocalModelJson<T>(
  env: Env,
  input: {
    model?: string;
    systemPrompt?: string;
    prompt: string;
    temperature?: number;
  }
): Promise<LocalModelResult<T>> {
  const model = input.model ?? defaultLocalModel(env);
  const response = await fetch(`${baseUrl(env)}/api/generate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model,
      system: input.systemPrompt,
      prompt: input.prompt,
      stream: false,
      format: "json",
      options: {
        temperature: input.temperature ?? 0.2
      }
    })
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Local model request failed: ${response.status} ${text}`);
  }
  const data = (await response.json()) as OllamaGenerateResponse;
  return {
    provider: "ollama",
    model,
    prompt: input.prompt,
    systemPrompt: input.systemPrompt,
    rawText: data.response,
    parsed: JSON.parse(data.response) as T
  };
}
