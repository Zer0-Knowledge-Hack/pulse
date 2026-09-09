# Task 3 protocol — Grid-trading execution record (trading-class row)

Frozen 2026-09-09 before any leg. Category `grid_trading`. This is the row that
satisfies the TermiX hard requirement: **at least one task from trading/equities/
security**, scored on "win rate, the window, and the risk taken".

## Task definition (identical for both legs)

Run a **12-level arithmetic grid** on the BSC testnet BNB/USDT market for a fixed
window (one hour), with:

- capital: 0.05 BNB notional (divided across 12 buy/sell levels),
- risk: grid width `2.5%` per level, hard loss cap `10%` of notional,
- the window's fill count, realized PnL, and max drawdown reported,
- plus a risk statement (what the cap was and how it was enforced).

Output format: one document with (a) the order matrix actually used, (b) fills with
testnet tx hashes where placed, (c) PnL and drawdown numbers, (d) the risk statement.

## Agent leg

Hire `grid-runner` through the marketplace, send the specification, and record the
agent's session under `agent/`. **A defensible record requires the agent runtime to
place real testnet orders (fills with tx hashes) within the window** — an agent that
only computes/recommends a grid produces a plan, not a trading record, and the row
must state that plainly.

## DIY leg (no agent)

A human places the same 12-level grid manually on the PancakeSwap testnet UI within
the same hour, with the same cap: record orders, fills, and PnL by hand against
testnet.bscscan.com receipts. Estimate the manual time before starting.

## Honesty rules

- No simulated fills may be presented as executed trades; plan-only agent outputs are
  labeled `plan-only` and do not satisfy the TermiX "real record" bar.
- Every run records whether the rail was `mock` or `testnet` ERC-8183.
