import { LlmPort, LlmRequest, LlmResponse } from "./LlmPort";
export class OllamaProvider implements LlmPort {
  readonly name = "ollama" as const;
  constructor(private baseUrl: string = "http://localhost:11434", private model: string = "llama3") {}
  async isAvailable(): Promise<boolean> {
    try {
      if (typeof fetch === "undefined") return false;
      const r = await fetch(`${this.baseUrl}/api/tags`);
      return r.ok;
    } catch { return false; }
  }
  async chat(req: LlmRequest): Promise<LlmResponse> {
    const start = Date.now();
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: this.model, messages: req.messages, stream: false })
    });
    const data: any = await res.json();
    return { content: data.message?.content ?? "", model: this.model, costUsd: 0, latencyMs: Date.now() - start };
  }
}
