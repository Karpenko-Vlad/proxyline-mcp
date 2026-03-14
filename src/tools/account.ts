import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ProxylineClient } from "../client.js";

export function registerAccountTools(server: McpServer, client: ProxylineClient) {
  server.registerTool(
    "get-balance",
    {
      title: "Get Balance",
      description: "Get account balance (regular and partner).",
      inputSchema: z.object({}),
    },
    async () => {
      const data = await client.getBalance();
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "list-tags",
    {
      title: "List Tags",
      description: "Get all available tags. Tag IDs can be used with manage-proxy-tags.",
      inputSchema: z.object({}),
    },
    async () => {
      const data = await client.getTags();
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );
}
