# Task 3 metrics — Grid-trading execution record

Rail state 2026-09-09: agent leg attempted; **verdict `plan-only`** (capability gap, see
`agent/output.md`); DIY leg not yet run (manual PancakeSwap grid available to the team if
 voulenteers). This session records the honest state; the TermiX "real record" bar is not met by this run.

## Pair state (per protocol.md)

| Dimension | Agent leg (`grid-runner`) | DIY leg |
|-----------|---------------------------|---------|
| Task | 12-level grid, 1h window, 2.5% width, 10% loss cap on 0.05 BNB | identical |
| Hire rail | `mock` (job `mock-4`, Funded) | TBD if executed |
| Order matrix | declared by card skill, **not delivered** (empty ack) | n/a until run |
| Fills | **0 — no testnet orders placed** | n/a until run |
| Win rate / window / risk | not measurable; risk definition frozen in protocol.md | n/a until run |
| Row state | **`plan-only` — does not satisfy the TermiX real-record bar** | pending a volunteer run |

## What closes this leg (and satisfies TermiX)

1. Stream A: expose the AgentCore runtime on the public endpoint (`message/send` /
   `tools/call` routing, or register a public AgentCore URL).
2. Confirm execution capability: real PancakeSwap testnet grid orders with tx hashes
   inside the one-hour window, 10% loss cap honored programmatically.
3. Stream H: funded buyer rail on ERC-8183 testnet for the on-chain escrow receipts.
4. Then run both legs the same day and fill this table with win rate, the window, and
   the risk taken — the TermiX-weighted row.
