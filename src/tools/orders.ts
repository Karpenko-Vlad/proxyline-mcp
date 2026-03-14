import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ProxylineClient } from "../client.js";

const VALID_PERIODS = ["5", "10", "20", "30", "60", "90", "120", "150", "180", "210", "240", "270", "300", "330", "360"] as const;

export function registerOrderTools(server: McpServer, client: ProxylineClient) {
  server.registerTool(
    "list-orders",
    {
      title: "List Orders",
      description: "Get a list of orders with optional date filters.",
      inputSchema: z.object({
        date_after: z
          .string()
          .optional()
          .describe("Order date lower bound (format: YYYY-MM-DD)"),
        date_before: z
          .string()
          .optional()
          .describe("Order date upper bound (format: YYYY-MM-DD)"),
      }),
    },
    async (params) => {
      const queryParams: Record<string, string> = {};
      if (params.date_after) queryParams.date_after = params.date_after;
      if (params.date_before) queryParams.date_before = params.date_before;

      const data = await client.getOrders(queryParams);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "renew-proxies",
    {
      title: "Renew Proxies",
      description:
        "Renew proxies by IDs with a specified period. Payment is deducted from account balance.",
      inputSchema: z.object({
        proxies: z
          .array(z.string())
          .describe("Proxy IDs to renew"),
        period: z
          .enum(VALID_PERIODS)
          .describe("Renewal period in days: 5, 10, 20, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360"),
        coupon: z.string().optional().describe("Optional discount coupon code"),
      }),
    },
    async (params) => {
      const body: Record<string, string | string[]> = {
        proxies: params.proxies,
        period: params.period,
      };
      if (params.coupon) body.coupon = params.coupon;

      const data = await client.renewProxies(body);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "create-order",
    {
      title: "Create Order",
      description:
        "Create a new proxy order. Payment is deducted from account balance. Specify either quantity or ip_list.",
      inputSchema: z.object({
        type: z.enum(["dedicated", "shared"]).describe("Proxy type (IPv6 only supports dedicated)"),
        ip_version: z.enum(["4", "6"]).describe("IP version"),
        country: z.string().describe("Country code (e.g. 'us', 'de', 'ru')"),
        period: z
          .enum(VALID_PERIODS)
          .describe("Order period in days"),
        quantity: z.number().optional().describe("Number of proxies to order (use this or ip_list)"),
        ip_list: z
          .array(z.string())
          .optional()
          .describe("Specific IP IDs to order (from list-ips). Use this or quantity."),
        coupon: z.string().optional().describe("Optional discount coupon code"),
      }),
    },
    async (params) => {
      const body: Record<string, string | string[]> = {
        type: params.type,
        ip_version: params.ip_version,
        country: params.country,
        period: params.period,
      };
      if (params.quantity !== undefined) body.quantity = String(params.quantity);
      if (params.ip_list) body.ip_list = params.ip_list;
      if (params.coupon) body.coupon = params.coupon;

      const data = await client.createOrder(body);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "get-order-amount",
    {
      title: "Get Order Amount",
      description:
        "Calculate the cost of an order before payment. Uses the same parameters as create-order.",
      inputSchema: z.object({
        type: z.enum(["dedicated", "shared"]).describe("Proxy type"),
        ip_version: z.enum(["4", "6"]).describe("IP version"),
        country: z.string().describe("Country code"),
        period: z.enum(VALID_PERIODS).describe("Order period in days"),
        quantity: z.number().optional().describe("Number of proxies"),
        ip_list: z.array(z.string()).optional().describe("Specific IP IDs"),
        coupon: z.string().optional().describe("Optional discount coupon code"),
      }),
    },
    async (params) => {
      const body: Record<string, string | string[]> = {
        type: params.type,
        ip_version: params.ip_version,
        country: params.country,
        period: params.period,
      };
      if (params.quantity !== undefined) body.quantity = String(params.quantity);
      if (params.ip_list) body.ip_list = params.ip_list;
      if (params.coupon) body.coupon = params.coupon;

      const data = await client.getOrderAmount(body);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );
}
