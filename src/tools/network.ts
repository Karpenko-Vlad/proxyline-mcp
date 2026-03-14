import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ProxylineClient } from "../client.js";

export function registerNetworkTools(server: McpServer, client: ProxylineClient) {
  server.registerTool(
    "list-countries",
    {
      title: "List Countries",
      description: "Get a list of available countries with nested cities. Country codes and city IDs can be used in other tools.",
      inputSchema: z.object({}),
    },
    async () => {
      const data = await client.getCountries();
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "list-ips",
    {
      title: "List IPs",
      description:
        "Get available IPs by type, version, and country. IP IDs can be used in create-order.",
      inputSchema: z.object({
        type: z.enum(["dedicated", "shared"]).describe("Proxy type (IPv6 only supports dedicated)"),
        ip_version: z.enum(["4", "6"]).describe("IP version"),
        country: z.string().describe("Country code (e.g. 'us', 'de')"),
        city: z.string().optional().describe("City ID (from list-countries)"),
      }),
    },
    async (params) => {
      const queryParams: Record<string, string> = {
        type: params.type,
        ip_version: params.ip_version,
        country: params.country,
      };
      if (params.city) queryParams.city = params.city;

      const data = await client.getIps(queryParams);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "get-ips-count",
    {
      title: "Get IPs Count",
      description:
        "Get the number of available IPs by parameters. Shows up to 1000.",
      inputSchema: z.object({
        type: z.enum(["dedicated", "shared"]).describe("Proxy type"),
        ip_version: z.enum(["4", "6"]).describe("IP version"),
        country: z.string().describe("Country code"),
        city: z.string().optional().describe("City ID (from list-countries)"),
      }),
    },
    async (params) => {
      const queryParams: Record<string, string> = {
        type: params.type,
        ip_version: params.ip_version,
        country: params.country,
      };
      if (params.city) queryParams.city = params.city;

      const data = await client.getIpsCount(queryParams);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }
  );
}
