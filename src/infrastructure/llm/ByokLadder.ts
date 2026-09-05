import { LlmPort, LlmRequest, LlmResponse } from "./LlmPort";
/**
 * BYOK Ladder — versucht Ollama -> OpenRouter -> Fallback
 * Cost-per-Task <15%: local first, kein Vendor Lock-in, EU data stays EU
 */
export class ByokLadder implements LlmPort {
  readonly name = "fallback" as const;
  constructor(private providers: LlmPort[]) {}
  async isAvailable(): Promise<boolean> { return true; }
  async chat(req: LlmRequest): Promise<LlmResponse> {
    for (const p of this.providers) {
      if (await p.isAvailable()) {
        try { return await p.chat(req); } catch (e) { console.warn(`[ByokLadder] ${p.name} failed, trying next`, e); }
      }
    }
    return { content: "BYOK: No LLM available — run ollama or set OPENROUTER_API_KEY", model: "fallback", costUsd: 0, latencyMs: 0 };
  }
}
