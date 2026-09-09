# Agent leg — task 3, 2026-09-09 (capability test = honest record)

- **Rail:** marketplace hire (mock adapter — no wallet)
- **Hire receipt:** job `mock-4`, status `Funded` (agent `grid-runner`,
  budget `100000000000000000` wei; mock tx `0xmock…00000000…4`)
- **Agent surface:** `https://gridrunner-agent.moisescisnerosdl.workers.dev` — card 200,
  `/mcp` 200, `/ping` HEALTHY

## Capability probe (raw, unedited)

    -- GET /.well-known/agent-card.json --
    skills: [negotiate, notify_funded] (declared)
    -- POST /mcp tools/list --
    tools: [calculate_grid_levels]
    -- POST /mcp tools/call calculate_grid_levels (arguments: spec) --
    { "jsonrpc": "2.0", "id": 3, "result": {} }
    -- A2A message/send route --
    NOT ROUTED — runtime lives in `agents/gridrunner/app/agent` (AgentCore)

## Verdict (the "asterisk", resolved honestly)

**Plan-capable on the card text (`calculates and outputs the grid order matrix and
execution plan`), but not executable on the public host today:** `tools/call` returns an
empty ack, no `message/send` routing exists, and no testnet orders can be attributed to
this surface. By protocol.md's honesty rules this leg is **`plan-only`** — it does not
satisfy the TermiX "real record" bar, and the row records exactly that.

## Risk statement (on the run actually recorded)

- Rail: `mock` (no chain-level escrow moved).
- No fills, no PnL, no drawdown measured — the trading window was not started because
  the runtime did not accept the task for execution; reporting otherwise would be a
  fabricated record.

## What closes this leg (stream A + H)

1. Runtime reachable publicly (route `message/send`/`tools/call` to AgentCore, or a
   public AgentCore URL registered as the endpoint).
2. Confirmed execution capability: the agent runtime places real PancakeSwap testnet
   orders within the window (fills with `bscscan` tx hashes).
3. A funded buyer rail (ERC-8183 testnet) if the receipts need the on-chain escrow rail.

DIY side (manual grid on PancakeSwap testnet for the same hour) remains an option the
team can run for the comparison column; estimated human cost is high (grid by hand on
UI counts as ~20–40 min of setup plus monitoring), which would make this the dramatic
row of the report if both legs became executable.
