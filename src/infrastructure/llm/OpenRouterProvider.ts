import { LlmPort, LlmRequest, LlmResponse } from "./LlmPort";
export class OpenRouterProvider implements LlmPort {
  readonly name = "openrouter" as const;
  constructor(private apiKey: string, private model: string = "anthropic/claude-3.5-sonnet") {}
  async isAvailable(): Promise<boolean> { return !!this.apiKey; }
  async chat(req: LlmRequest): Promise<LlmResponse> {
    const start = Date.now();
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${this.apiKey}` },
      body: JSON.stringify({ model: this.model, messages: req.messages, max_tokens: req.maxTokens })
    });
    const data: any = await res.json();
    const content = data.choices?.[0]?.message?.content ?? "";
    const cost = data.usage ? (data.usage.prompt_tokens * 0.003 + data.usage.completion_tokens * 0.015)/1000 : undefined;
    return { content, model: this.model, costUsd: cost, latencyMs: Date.now() - start };
  }
}
