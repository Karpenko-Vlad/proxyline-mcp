# Proxytline MCP

MCP server that wraps the [Proxyline](https://panel.proxyline.net) proxy provider API, exposing all methods as MCP tools for AI assistants.

## Tools

### Read-only
| Tool | Description |
|------|-------------|
| `list-proxies` | Get proxies with filters (status, type, country, dates, etc.) |
| `list-orders` | Get orders with optional date filters |
| `list-countries` | Get countries with nested cities |
| `list-ips` | Get available IPs by type/version/country |
| `get-ips-count` | Get count of available IPs |
| `get-balance` | Get account balance |
| `list-tags` | Get all tags |

### Mutating
| Tool | Description |
|------|-------------|
| `renew-proxies` | Renew proxies by IDs with period |
| `create-order` | Create new proxy order |
| `get-order-amount` | Calculate order cost before payment |
| `manage-proxy-tags` | Add/set/remove tags on proxies |

## Setup

```bash
npm install
npm run build
```

## Configuration

Add to your MCP client config (e.g. `~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "proxyline": {
      "command": "node",
      "args": ["/path/to/proxytline-mcp/dist/index.js"],
      "env": {
        "PROXYLINE_API_KEY": "your-api-key"
      }
    }
  }
}
```

Get your API key at [panel.proxyline.net](https://panel.proxyline.net).

## Usage Examples

Once connected, you can ask your AI assistant things like:

- "Show me all active proxies in Germany"
- "How much would 10 dedicated IPv4 proxies in the US cost for 30 days?"
- "Renew proxies 12345 and 12346 for 60 days"
- "What's my current balance?"
- "Tag all proxies from order #123 with tag 'production'"
