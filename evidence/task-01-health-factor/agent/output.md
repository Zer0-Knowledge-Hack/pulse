# Agent leg — capability run + limitation record, 2026-09-09

- **Rail:** marketplace hire (`POST /jobs`, mock adapter — no wallet) + public-agent probes
- **Hire receipt:** job `mock-1`, status `Funded`, mock tx
  `0xmock…0000000000000000000000000000000000000000000000000000000001`, spend cap `100000000000000000`
  (rail `mock`; no ERC-8183 testnet receipt at this run)
- **Agent surface:** `https://hfwatch-agent.moisescisnerosdl.workers.dev` (card 200, `/mcp` 200,
  `/ping` HEALTHY)

## Capability probe (raw, unedited)

    -- GET /.well-known/agent-card.json --
    skills: [negotiate, notify_funded] (declared)
    -- POST /mcp initialize --
    {
      "jsonrpc": "2.0", "id": 1,
      "result": { "protocolVersion": "2024-11-05", "capabilities": { "tools": {} },
                  "serverInfo": { "name": "hfwatch-agent", "version": "1.0.0" } }
    }
    -- POST /mcp tools/list --
    tools: [get_health_factor]
    -- POST /mcp tools/call get_health_factor (arguments: watch address) --
    { "jsonrpc": "2.0", "id": 3, "result": {} }
    -- A2A message/send route --
    NOT ROUTED — `message/send` does not exist on the deployed Worker; the runtime
    (Studio AgentCore app with wallet signing) lives in `agents/hfwatch/app/agent`
    and is not reachable on this public host

## Interpretation (honest)

The deployed Worker is a **discovery + contract surface**, not a task executor:

1. The card declares the skills and the MCP server exposes the tool names, but
   `tools/call` answers an empty acknowledgement (`result: {}`) — no computation happens.
2. The runtime that would execute monitoring (Agent Studio runtime in `app/agent`,
   with the keystore signing path for ERC-8183 negotiation) publishes only to AgentCore.
3. Consequence: the agent's actual competency on the task (per-market breakdown, verdict)
   cannot be measured from the public endpoint yet, so the agent-vs-DIY measured pair in
   `metrics.md` records the hire receipt + the capability gap instead of a fabricated output.

## What closes this leg (stream A)

One of:

- route `message/send` (+ `tools/call`) on the public Worker to the AgentCore runtime, or
- publish the AgentCore-hosted runtime URL and point the fixture endpoints at it (update
  endpoints on-chain via `bag erc8004 update-endpoint`).

Until then, the DIY leg (`diy/output.md`) stands alone as the measured side and the
"proven agent advantage" row for task 1 stays incomplete **by protocol** — see `metrics.md`.
