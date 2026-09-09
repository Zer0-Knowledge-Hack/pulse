# Task 2 metrics — Yield-APR comparison sweep

Rail state 2026-09-09: DIY **measured** (scripted no-agent competitor, public DefiLlama
scan); agent **attempted, limited** — public surface is a discovery stub (see
`agent/output.md`). Pair cannot close until the AgentCore runtime is reachable publicly.

## Pair state (per protocol.md)

| Dimension | Agent leg (`yield-router`) | DIY leg (2026-09-09) |
|-----------|---------------------------|----------------------|
| Task | $10k USDT → top venue + net APR + allocation verdict | identical |
| Hire rail | `mock` (job `mock-3`, Funded) | 0 |
| Time | not measurable (`tools/call` → `result: {}`) | ~2–4 s scripted scan of 17k pools; 10–20 min by hand |
| Cost | hire pending runtime | 0 tokens; human time |
| Output quality | pending | top venue (Pancake `CAKE-WBNB` 4.20%, with IL caveat) + stable pick (Venus USDT 2.53%) + `split` verdict + provenance trail |
| Row state | incomplete by protocol (capability gap in `agent/output.md`) | complete |

## What closes this leg

Stream A: route `message/send` / `tools/call` on the public Worker to the AgentCore
runtime, or publish and register the AgentCore-hosted URL (`bag erc8004 update-endpoint`).
Then: re-hire, capture the agent's ranking + verdict, and fill the missing column.
