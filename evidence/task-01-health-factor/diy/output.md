# DIY leg — dry run, 2026-09-06

- **Rail:** `dry-run` (no agents, no marketplace; generic RPC tooling only)
- **Runner:** signal stream's scripting environment (pnpm + viem), acting as the
  no-agent competitor
- **Input address:** `0x22f3e24233B9BDcC65fa855495D99Fe7d2458510` (the team watch wallet; no
  funded Venus position yet — see protocol.md honesty notes)
- **Network/rails touched:** BSC testnet public RPC (`bsc-testnet-rpc.publicnode.com`), Venus
  testnet Core Pool comptroller `0x94d1820b2D1c7c7452A163983Dc888CEC546b77D`
- **Machine time of the scripted walk:** ~1.3 s (one `getAssetsIn` call)

## Raw output (unedited)

```
[t+1276ms] getAssetsIn(0x22f3e24233B9BDcC65fa855495D99Fe7d2458510) -> [] (0 entered markets)
[t+1276ms] verdict: no entered market. The DIY actor would now have to explain that this
address has supply-side dust in no market (balanceOf > 0 but never entered), i.e. an
effectively untracked position.
```

## Interpretation against the protocol

1. Health factor: **not computable** — the address has vBNB supply dust but no entered market and
   no borrow (`getAssetsIn` empty). A human following the DIY steps would burn most of their time
   discovering exactly this negative result.
2. Collateral/borrow values: `0` (nothing entered).
3. Per-market breakdown: empty, with one footnote (vBNB dust, not collateral-eligible).
4. Verdict produced: `n/a — no tracked position`; a real human under deadline pressure would miss
   that subtlety and either misreport HF as `∞` or drop the address.

## Manual-procedure cost (what the same task costs *by hand*, no scripting)

| Protocol step | Est. human time | Failure modes |
|---|---|---|
| Identify vTokens held from explorer | 2–5 min | reading wrong decimals |
| Map vToken → underlying + market page | 3–6 min per market | stale/multiple pool confusion |
| Exchange rates + oracle prices by hand | 5–10 min | unit/scaling mistakes |
| Collateral factors from comptroller | 3–5 min | calling the wrong pool's comptroller |
| Compute breakdown + verdict | 5–10 min | arithmetic slips; no audit trail |

Total: **~20–35 min by hand first time**, minutes on each repeat, and the output is a one-shot
snapshot with no breakdown, no verdict policy, and no reproducible provenance.

## What changes on the final (non-dry) run

Re-run both legs against the funded team position on Venus testnet; then `metrics.md` carries the
measured pair (agent via marketplace round-trip vs this DIY baseline).
