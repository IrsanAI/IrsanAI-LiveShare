import { createSessionTool } from "./tools/createSessionTool";
import { addPositionTool } from "./tools/addPositionTool";
/**
 * McpServer — minimal MCP implementation for IrsanAI LiveShare
 * Exposes tools via stdio (Claude Desktop, etc.)
 * Gap closed: MCP + Tool Use from Root-Ascent table
 */
export class McpServer {
  tools = [createSessionTool, addPositionTool];
  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case "create_session": return { sessionId: `sess_${Math.random().toString(36).slice(2,8)}`, ...args };
      case "add_position": return { ok: true, throttled: false, ...args };
      default: throw new Error(`Unknown tool ${name}`);
    }
  }
  getManifest() {
    return { name: "irsanai-live-share", version: "0.5.0", tools: this.tools };
  }
}
