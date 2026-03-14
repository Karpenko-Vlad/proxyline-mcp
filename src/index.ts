#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ProxylineClient } from "./client.js";
import { registerProxyTools } from "./tools/proxies.js";
import { registerOrderTools } from "./tools/orders.js";
import { registerNetworkTools } from "./tools/network.js";
import { registerAccountTools } from "./tools/account.js";

const apiKey = process.env.PROXYLINE_API_KEY;
if (!apiKey) {
  console.error("PROXYLINE_API_KEY environment variable is required");
  process.exit(1);
}

const client = new ProxylineClient(apiKey);

const server = new McpServer({
  name: "proxytline-mcp",
  version: "1.0.0",
});

registerProxyTools(server, client);
registerOrderTools(server, client);
registerNetworkTools(server, client);
registerAccountTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
