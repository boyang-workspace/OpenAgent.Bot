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

function cleanedJsonCandidate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]?.trim()) return fenced[1].trim();

  const firstBrace = trimmed.search(/[\[{]/);
  if (firstBrace === -1) return trimmed;

  const opening = trimmed[firstBrace];
  const closing = opening === "[" ? "]" : "}";
  const lastBrace = trimmed.lastIndexOf(closing);
  if (lastBrace > firstBrace) return trimmed.slice(firstBrace, lastBrace + 1).trim();

  return trimmed.slice(firstBrace).trim();
}

function parseLocalJson<T>(rawText: string): T {
  const candidate = cleanedJsonCandidate(rawText);
  if (!candidate) {
    throw new Error("Local model returned an empty JSON response.");
  }
  return JSON.parse(candidate) as T;
}

async function requestOllamaGenerate(
  env: Env,
  input: {
    model: string;
    systemPrompt?: string;
    prompt: string;
    temperature?: number;
  }
): Promise<OllamaGenerateResponse> {
  const response = await fetch(`${baseUrl(env)}/api/generate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model: input.model,
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
  return (await response.json()) as OllamaGenerateResponse;
}

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
  const prompts = [
    input.prompt,
    [
      input.prompt,
      "",
      "Return only valid JSON.",
      "Do not wrap the answer in markdown fences.",
      "Do not add commentary before or after the JSON.",
      "Ensure every object, array, quote, and brace is closed."
    ].join("\n")
  ];

  let rawText = "";
  let parsed: T | undefined;
  let lastError: unknown;

  for (const prompt of prompts) {
    try {
      const response = await requestOllamaGenerate(env, {
        model,
        systemPrompt: input.systemPrompt,
        prompt,
        temperature: input.temperature
      });
      rawText = response.response;
      parsed = parseLocalJson<T>(rawText);
      return {
        provider: "ollama",
        model,
        prompt,
        systemPrompt: input.systemPrompt,
        rawText,
        parsed
      };
    } catch (caught) {
      lastError = caught;
    }
  }

  const reason = lastError instanceof Error ? lastError.message : "Local model returned invalid JSON.";
  throw new Error(reason);
}
