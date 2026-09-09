/**
 * Public Cloudflare Worker for hfwatch agent.
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
        agent: "hfwatch-agent",
        version: "0.1.0",
        network: "bsc-testnet",
        chainId: 97,
        wallet: "0x6d07BBc31ea6A9d05B323123470Ae2a7955FfCad",
        endpoints: {
          a2a: `${hostUrl}/.well-known/agent-card.json`,
          mcp: `${hostUrl}/mcp`,
        },
      });
    }

    // A2A Agent Card
    if (url.pathname === "/.well-known/agent-card.json") {
      const agentCard = {
        name: "hfwatch-agent",
        description: "ERC-8183 seller agent (hfwatch-agent) — negotiate + notify_funded over A2A on BNB Smart Chain.",
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
              'After funding on-chain, send {"skill": "notify_funded", "job_id": <int>}. The seller verifies and executes Venus health factor monitoring analysis.',
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
            name: "hfwatch-agent",
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
                  name: "hfwatch-agent",
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
                    name: "get_health_factor",
                    description: "Fetch Venus protocol account health factor and collateral status on BSC.",
                    inputSchema: {
                      type: "object",
                      properties: {
                        account: { type: "string", description: "Account address to inspect" },
                      },
                      required: ["account"],
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
