# Agent Advantage Report

_pulse_ — hireable agent marketplace on BNB Chain · BNB Chain "Build the Era" hackathon
Stream S (`fercodes`). Draft status: task 1 recorded; tasks 2–3 outlined.

## Agent-side of the market

pulse's featured agents are category-native DeFi agents maintained by the team (four BNB Agent Studio
projects under `agents/`, ERC-8004 registrations on BSC testnet chain 97) and compared in the
marketplace with live on-chain signals, not descriptions.

## Task 1 — Health-factor monitoring (health_factor)

**Task:** given a Venus Protocol position address on BSC, produce (a) the current health factor,
(b) collateral value in USD, (c) total borrow value, and (d) an action verdict
(`safe` / `sharpen caps` / `act now`), along with the per-market breakdown.

- Protocol and both legs: [`task-01-health-factor/protocol.md`](task-01-health-factor/protocol.md)
- DIY run: [`task-01-health-factor/diy/output.md`](task-01-health-factor/diy/output.md)
- Comparison: [`task-01-health-factor/metrics.md`](task-01-health-factor/metrics.md)

### Comparison (summary — full table in metrics.md)

| Dimension | Agent (hfwatch via marketplace) | DIY (manual) | Verdict |
|-----------|--------------------------------|--------------|---------|
| Time | _pending live agent leg_ | _dry-run recorded_ | — |
| Cost | _pending_ (target: hire in $U ≤ 0.01) | human time, 0 tokens | — |
| Output quality | _pending_ | one-shot point-in-time values, no breakdown, no verdict | — |

### Rails recorded

- DIY leg rail: `dry-run` (manual RPC/UI procedure, no marketplace) — final run to be recorded
  against the team's funded Venus testnet position.
- Agent leg rail: `pending` — requires workstream A's live hfwatch endpoint and a marketplace
  hire (mock adapter acceptable for rail `mock`, testnet escrow preferred).

## Task breakdown plan (tasks 2–3)

Requirements from the TermiX spec: both legs must run through the marketplace; ≥1 task must be
trading/equities/security.

- **Task 2 — Yield-APR comparison sweep** (`yield`): given USD 10k notional, produce current net
  APR, venue, and allocation verdict across Venus/Lista vs PancakeSwap farms; DIY = reading four
  protocol dashboards manually. Agent leg: `yield-router`. Rail: mock (this cycle) → testnet.
  **Status 2026-09-09: DIY measured** (scripted public scan — Pancake CAKE-WBNB 4.20%,
  Venus USDT 2.53%, `split` verdict); agent hired (`mock-3`) — public host is a discovery
  stub, agent output not measurable yet.
- **Task 3 — Grid-trading execution record** (`grid_trading`, satisfies the hard trading-class
  requirement): 12-level BNB/USDT grid on PancakeSwap testnet for a fixed window; report fill rate,
  realized PnL, and risk taken (grid width, cap). DIY = manually placing and managing the same
  grid orders. Agent leg: `gridrunner`. This is the TermiX-weighted task ("trading agents need a
  real record: win rate, the window, and the risk taken").
  **Status 2026-09-09: agent hired (`mock-4`); verdict `plan-only`** — declared capability
  exists, executable runtime is not publicly reachable, zero testnet fills; limitation
  recorded by protocol; ranking this row honestly above the fake-execution temptation.

## Report checklist (from TermiX spec)

- [ ] ≥3 real tasks run both ways — all three tasks hired through the marketplace; the pair
  closes for task 1 and 2 when stream A's runtime is reachable publicly (capability gap
  documented per task folder)
- [x] Time/cost/quality structure defined per task (see task folders)
- [x] Actual outputs attached for every recorded leg (DIY measured runs + capability probes;
  agent legs recorded as digs-in-progress with raw probe transcripts)
- [ ] ≥1 trading/equities/security task (task 3 reserved; honest state: `plan-only` this cycle)
