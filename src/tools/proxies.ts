import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ProxylineClient } from "../client.js";

export function registerProxyTools(server: McpServer, client: ProxylineClient) {
  server.registerTool(
    "list-proxies",
    {
      title: "List Proxies",
      description:
        "Get a list of proxies with optional filters. Returns proxy details including IP, ports, credentials, country, dates, and tags.",
      inputSchema: z.object({
        ids: z
          .array(z.string())
          .optional()
          .describe("Filter by proxy IDs"),
        status: z
          .enum(["active", "expired", "deleted", "exclude_deleted"])
          .optional()
          .describe("Filter by proxy status"),
        type: z
          .enum(["dedicated", "shared"])
          .optional()
          .describe("Filter by proxy type"),
        ip_version: z
          .enum(["4", "6"])
          .optional()
          .describe("Filter by IP version"),
        country: z
          .array(z.string())
          .optional()
          .describe("Filter by country codes (e.g. 'us', 'de')"),
        date_after: z
          .string()
          .optional()
          .describe("Order date lower bound (format: YYYY-MM-DD)"),
        date_before: z
          .string()
          .optional()
          .describe("Order date upper bound (format: YYYY-MM-DD)"),
        date_end_after: z
          .string()
          .optional()
          .describe("Order end date lower bound (format: YYYY-MM-DD)"),
        date_end_before: z
          .string()
          .optional()
          .describe("Order end date upper bound (format: YYYY-MM-DD)"),
        orders: z
          .array(z.string())
          .optional()
          .describe("Filter by order IDs"),
        limit: z
          .number()
          .optional()
          .describe("Max proxies to return (default 500, max 2000)"),
        offset: z.number().optional().describe("Pagination offset"),
      }),
    },
    async (params) => {
      const queryParams: Record<string, string | string[]> = {};

      if (params.ids) queryParams.ids = params.ids;
      if (params.status) queryParams.status = params.status;
      if (params.type) queryParams.type = params.type;
      if (params.ip_version) queryParams.ip_version = params.ip_version;
      if (params.country) queryParams.country = params.country;
      if (params.date_after) queryParams.date_after = params.date_after;
      if (params.date_before) queryParams.date_before = params.date_before;
      if (params.date_end_after) queryParams.date_end_after = params.date_end_after;
      if (params.date_end_before) queryParams.date_end_before = params.date_end_before;
      if (params.orders) queryParams.orders = params.orders;
      if (params.limit !== undefined) queryParams.limit = String(params.limit);
      if (params.offset !== undefined) queryParams.offset = String(params.offset);

      const data = await client.getProxies(queryParams);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "manage-proxy-tags",
    {
      title: "Manage Proxy Tags",
      description:
        "Add, set, or remove tags on proxies. Proxies are selected using the same filters as list-proxies.",
      inputSchema: z.object({
        action: z
          .enum(["add", "set", "remove"])
          .describe("Action to perform: add tags, set tags (replacing previous), or remove tags"),
        tag_ids: z
          .array(z.string())
          .describe("Tag IDs to add/set/remove"),
        // Proxy filters
        ids: z.array(z.string()).optional().describe("Filter by proxy IDs"),
        status: z
          .enum(["active", "expired", "deleted", "exclude_deleted"])
          .optional()
          .describe("Filter by proxy status"),
        type: z.enum(["dedicated", "shared"]).optional().describe("Filter by proxy type"),
        ip_version: z.enum(["4", "6"]).optional().describe("Filter by IP version"),
        country: z.array(z.string()).optional().describe("Filter by country codes"),
        orders: z.array(z.string()).optional().describe("Filter by order IDs"),
      }),
    },
    async (params) => {
      const filterParams: Record<string, string | string[]> = {};
      if (params.ids) filterParams.ids = params.ids;
      if (params.status) filterParams.status = params.status;
      if (params.type) filterParams.type = params.type;
      if (params.ip_version) filterParams.ip_version = params.ip_version;
      if (params.country) filterParams.country = params.country;
      if (params.orders) filterParams.orders = params.orders;

      const body: Record<string, string | string[]> = {
        action: params.action,
        ids: params.tag_ids,
      };

      const data = await client.manageProxyTags(filterParams, body);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );
}
