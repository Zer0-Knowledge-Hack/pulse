# Task 2 protocol — Yield-APR comparison sweep

Frozen 2026-09-09 before any leg. §5 of the Agent Advantage Report; category `yield`.

## Task definition (identical for both legs)

Given a **$10,000 USDT notional on BNB Chain**, produce:

1. the **top net-APR venue** among: liquidity staking (Lista), Venus money-market,
   PancakeSwap CAKE farms/LP,
2. the **net APR** value of that pick and of the runner-up,
3. an **allocation verdict** (` park` / `split` / `move`) with the share per venue,
4. a one-line provenance note (where each number came from, timestamps included).

Output format: one document; no narrative padding.

## DIY leg (no agent, no marketplace)

A competent DeFi user does the task by hand: open the Lista staking page, the Venus
dashboard and the PancakeSwap info/farm pages, read each venue's current deposit/LP
APY, convert to net terms (subtract nothing beyond stated fees — a scripted run
records exactly what the pages/APIs return) and write the comparison + verdict.

Scripted equivalent recorded in `diy/output.md`: public third-party aggregation
(DefiLlama `yields` endpoint) scanning every BSC pool of the three venues and sorting
by APY — the no-agent competitor that a human's manual sweep approximates.

## Agent leg

Hire `yield-router` through the marketplace (`POST /jobs`), then send the same task
specification to the agent runtime (A2A/MCP per its declared card) and record the raw
output under `agent/`.

## Honesty rules

- Prototype runs are labeled (`mock` / scenario); the measured pair only counts once
  both legs produce the four sections on the same notional and date.
- Public third-party data counts for the DIY side only (no agent involvement).
