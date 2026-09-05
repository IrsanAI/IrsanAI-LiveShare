export interface LlmMessage { role: "system" | "user" | "assistant"; content: string; }
export interface LlmRequest { messages: LlmMessage[]; maxTokens?: number; temperature?: number; }
export interface LlmResponse { content: string; model: string; costUsd?: number; latencyMs: number; }
export interface LlmPort {
  readonly name: "ollama" | "openrouter" | "fallback";
  isAvailable(): Promise<boolean>;
  chat(req: LlmRequest): Promise<LlmResponse>;
}
