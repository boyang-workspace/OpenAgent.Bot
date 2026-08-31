import type { ActorType } from "./types";

export type BotSignature = { pattern: RegExp; actorType: Exclude<ActorType, "human" | "api_client" | "unknown_bot">; actorName: string; confidence: number };

export const botRegistry: BotSignature[] = [
  { pattern: /Googlebot/i, actorType: "search_bot", actorName: "Googlebot", confidence: 1 },
  { pattern: /GoogleOther/i, actorType: "search_bot", actorName: "GoogleOther", confidence: 1 },
  { pattern: /bingbot/i, actorType: "search_bot", actorName: "Bingbot", confidence: 1 },
  { pattern: /DuckDuckBot/i, actorType: "search_bot", actorName: "DuckDuckBot", confidence: 1 },
  { pattern: /YandexBot/i, actorType: "search_bot", actorName: "YandexBot", confidence: 1 },
  { pattern: /Baiduspider/i, actorType: "search_bot", actorName: "Baiduspider", confidence: 1 },
  { pattern: /GPTBot/i, actorType: "ai_crawler", actorName: "GPTBot", confidence: 1 },
  { pattern: /OAI-SearchBot/i, actorType: "ai_crawler", actorName: "OAI SearchBot", confidence: 1 },
  { pattern: /ClaudeBot/i, actorType: "ai_crawler", actorName: "ClaudeBot", confidence: 1 },
  { pattern: /Claude-SearchBot/i, actorType: "ai_crawler", actorName: "Claude SearchBot", confidence: 1 },
  { pattern: /PerplexityBot/i, actorType: "ai_crawler", actorName: "PerplexityBot", confidence: 1 },
  { pattern: /Google-Extended/i, actorType: "ai_crawler", actorName: "Google Extended", confidence: 1 },
  { pattern: /meta-externalagent|meta-externalfetcher/i, actorType: "ai_crawler", actorName: "Meta AI crawler", confidence: 1 },
  { pattern: /CCBot/i, actorType: "ai_crawler", actorName: "Common Crawl", confidence: .95 },
  { pattern: /ChatGPT-User/i, actorType: "ai_agent", actorName: "ChatGPT", confidence: 1 },
  { pattern: /Claude-User/i, actorType: "ai_agent", actorName: "Claude", confidence: 1 },
  { pattern: /Perplexity-User/i, actorType: "ai_agent", actorName: "Perplexity", confidence: 1 },
  { pattern: /cohere-ai/i, actorType: "ai_agent", actorName: "Cohere Agent", confidence: .9 }
];
