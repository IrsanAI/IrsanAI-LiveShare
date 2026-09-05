/**
 * MCP Tool: createSession — exposed to Claude / MCP clients
 * Tool Use = Agent als Executor, Mensch als Supervisor
 */
export const createSessionTool = {
  name: "create_session",
  description: "Create a new LiveShare session with destination and message",
  inputSchema: {
    type: "object",
    properties: {
      destination: { type: "object", description: "{latitude, longitude, name?}" },
      message: { type: "string", description: "Wo/Wohin/Wie lange text" },
      hostDisplayName: { type: "string" }
    },
    required: ["destination", "message"]
  }
};
