/**
 * Public Cloudflare Worker for gridrunner agent.
 * Exposes A2A agent card at /.well-known/agent-card.json and MCP endpoint at /mcp.
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, mcp-session-id",
};

function jsonResponse(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    const hostUrl = `${url.protocol}//${url.host}`;

    // Liveness / Ping
    if (url.pathname === "/ping" || url.pathname === "/") {
      return jsonResponse({
        status: "HEALTHY",
        agent: "gridrunner-agent",
        version: "0.1.0",
        network: "bsc-testnet",
        chainId: 97,
        wallet: "0x78f800FBA857Ae0a33eEa55f62a68ddA20b27185",
        endpoints: {
          a2a: `${hostUrl}/.well-known/agent-card.json`,
          mcp: `${hostUrl}/mcp`,
        },
      });
    }

    // A2A Agent Card
    if (url.pathname === "/.well-known/agent-card.json") {
      const agentCard = {
        name: "gridrunner-agent",
        description: "ERC-8183 seller agent (gridrunner-agent) — automated arithmetic and geometric grid trading orders strategy on BNB Chain.",
        url: `${hostUrl}/`,
        version: "1.0.0",
        protocolVersion: "0.3.0",
        preferredTransport: "JSONRPC",
        capabilities: {
          streaming: false,
        },
        defaultInputModes: ["application/json"],
        defaultOutputModes: ["application/json"],
        skills: [
          {
            id: "negotiate",
            name: "Negotiate an ERC-8183 job",
            description:
              'Send a data part {"skill": "negotiate", "task_description": "...", "terms": {"deliverables": "...", "quality_standards": "..."}} and receive a wallet-signed price quote (price, currency, negotiation_hash, provider_sig). Anchor on-chain via createJob + fund.',
            tags: ["erc8183", "negotiation", "bnb-chain"],
            inputModes: ["application/json"],
            outputModes: ["application/json"],
          },
          {
            id: "notify_funded",
            name: "Notify the seller a job is funded (request delivery)",
            description:
              'After funding on-chain, send {"skill": "notify_funded", "job_id": <int>}. The seller calculates and outputs the grid order matrix and execution plan.',
            tags: ["erc8183", "delivery", "bnb-chain"],
            inputModes: ["application/json"],
            outputModes: ["application/json"],
          },
        ],
      };
      return jsonResponse(agentCard);
    }

    // MCP Endpoint
    if (url.pathname === "/mcp") {
      if (request.method === "GET") {
        return jsonResponse({
          status: "active",
          serverInfo: {
            name: "gridrunner-agent",
            version: "1.0.0",
          },
          protocol: "mcp",
          transport: "streamableHttp",
        });
      }

      if (request.method === "POST") {
        try {
          const body = (await request.json()) as any;
          const id = body?.id ?? 1;

          if (body?.method === "initialize") {
            return jsonResponse({
              jsonrpc: "2.0",
              id,
              result: {
                protocolVersion: "2024-11-05",
                capabilities: {
                  tools: {},
                },
                serverInfo: {
                  name: "gridrunner-agent",
                  version: "1.0.0",
                },
              },
            });
          }

          if (body?.method === "tools/list") {
            return jsonResponse({
              jsonrpc: "2.0",
              id,
              result: {
                tools: [
                  {
                    name: "calculate_grid_levels",
                    description: "Generate geometric or arithmetic price grids and order allocations for DEX token pairs.",
                    inputSchema: {
                      type: "object",
                      properties: {
                        pair: { type: "string", description: "Trading pair (e.g. BNB/USDT)" },
                        lower_price: { type: "number", description: "Lower boundary of the grid range" },
                        upper_price: { type: "number", description: "Upper boundary of the grid range" },
                        grids_count: { type: "number", description: "Number of grid levels (e.g. 10)" },
                      },
                      required: ["pair", "lower_price", "upper_price", "grids_count"],
                    },
                  },
                ],
              },
            });
          }

          // Fallback JSON-RPC echo / ack
          return jsonResponse({
            jsonrpc: "2.0",
            id,
            result: {},
          });
        } catch {
          return jsonResponse({ error: "Invalid JSON-RPC payload" }, 400);
        }
      }
    }

    return jsonResponse({ error: "Not Found", path: url.pathname }, 404);
  },
};
