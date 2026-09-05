/**
 * LlmPort — BYOK Ladder Root-Ascent 2030
 * Keine API Keys im Repo, User bringt eigenen Key (BYOK)
 * Ollama local first (kosten 0, privacy max), dann OpenRouter, dann Fallback
 */
export interface LlmMessage { role: "system" | "user" | "assistant"; content: string; }
export interface LlmRequest { messages: LlmMessage[]; maxTokens?: number; temperature?: number; }
export interface LlmResponse { content: string; model: string; costUsd?: number; latencyMs: number; }
export interface LlmPort {
  readonly name: "ollama" | "openrouter" | "fallback";
  isAvailable(): Promise<boolean>;
  chat(req: LlmRequest): Promise<LlmResponse>;
}
