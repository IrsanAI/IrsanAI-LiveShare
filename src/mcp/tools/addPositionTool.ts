export const addPositionTool = {
  name: "add_position",
  description: "Add GPS position to active session (throttled by GpsThrottlePolicy)",
  inputSchema: {
    type: "object",
    properties: {
      sessionId: { type: "string" },
      latitude: { type: "number" }, longitude: { type: "number" }, accuracy: { type: "number" }
    },
    required: ["sessionId", "latitude", "longitude"]
  }
};
