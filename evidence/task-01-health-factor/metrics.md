# Task 1 metrics — Health-factor monitoring

Status as of 2026-09-09 (closing run): watch position **live** (HF `1.838`, liq price `$326.44`
served by `GET /agents/hf-watch/signal`); DIY leg **measured**; agent leg **attempted and
recorded honestly** — the public agent surface is a discovery stub, so the measured pair cannot
close until the runtime is reachable (see `agent/output.md`).

## Final pair state

| Dimension | Agent leg (`hf-watch`) | DIY leg (2026-09-09, real position) |
|-----------|------------------------|-------------------------------------|
| Task | HF + collateral/borrow + breakdown + verdict | identical |
| Hire rail | `mock` (job `mock-1`, Funded; no wallet) — testnet ERC-8183 pending a funded buyer | 0 |
| Time | **not measurable** — `tools/call` answers `result: {}`; `message/send` not routed | ~1.5 s scripted; 20–35 min by hand |
| Cost | hire price pending runtime availability | 0 tokens; human time |
| Output quality | pending — no computation on the public endpoint | four sections incl. breakdown + rule verdict (HF 1.838 → `act now`) |
| Row state | **incomplete by protocol** (capability gap documented in `agent/output.md`) | complete measurements attached |

## Historical dry-run (2026-09-06, pre-funding — kept for the record)

## Measured DIY leg (2026-09-09, real position, rail `no-agent competitor script`)

| Section | Value |
|---------|-------|
| Health factor | **1.838032547701963** (read via the same comptroller accounting the deployer reader uses) |
| Collateral value | 0.035 tBNB supplied into vBNB (≈ $15.3 risk-adjusted at CF 0.70, price $600) |
| Borrow value | 8 $U borrowed (price $1.00) |
| Approx. liquidation price | **$326.44** |
| Machine time | ~1.5 s (batched JSON-RPC) |
| Manual equivalent | 20–35 min first run, minutes per repeat (see dry-run table below) |
| Verdict policy | `safe`HF≥3 / `sharpen caps` 3>HF≥1.5 / `act now`HF<1.5 → **`act now`** |

## Comparison target (frozen by protocol.md)

| Dimension | Agent leg (`hf-watch` via marketplace) | DIY leg |
|-----------|----------------------------------------|---------|
| Task | HF + collateral/borrow + breakdown + verdict for the given address | identical |
| Cost | hire price in $U recorded from the real job receipt | 0 tokens; human time |
| Time | wall-clock from "hire clicked" to validated output | wall-clock of the manual procedure |

## Current standings (DIY done, agent pending)

| Dimension | Agent | DIY | Notes |
|-----------|-------|-----|-------|
| Time | _pending live agent_ | machine: ~1.5 s scripted; human: est. 20–35 min first run | DIY script = the strong baseline; the agent must beat dollars-and-seconds, not humans |
| Cost | _pending_ (target ≤ 0.01 $U hire) | 0 | |
| Output quality | _pending_ | four sections incl. per-market breakdown + rule-based verdict + provenance | the DIY output is honest but context-free |

## Historical dry-run (2026-09-06, pre-funding — kept for the record)

| Dimension | Agent | DIY | Notes |
|-----------|-------|-----|-------|
| Time | _pending_ | machine: 1.3 s scripted; human: est. 20–35 min first run | dry-run against an unfunded address |
| Cost | _pending_ | 0 | |
| Output quality | _pending_ | verdict `n/a` on this input; no breakdown; no replayability | kept unedited below in `diy/output.md` |

## Quality rubric used for the verdict section

- `safe` HF ≥ 3 · `sharpen caps` 3 > HF ≥ 1.5 · `act now` HF < 1.5
- breakdown required per entered market; missing verdicts disqualify the leg
- provenance: raw outputs must be attached unedited (one file per leg)

## To do to convert this into a TermiX-countable row

1. ~~Fund the watch wallet + create the Venus testnet position~~ ✅ done 2026-09-09
2. Workstream A: deploy hfwatch → hand over endpoint + ERC-8004 registration (A already deployed
   all four agents per #20/#22 — the remaining gap is the marketplace-hire leg through the
   catalog)
3. ~~Workstream H: testnet hire for the agent leg receipt~~ rail available (#12 real ERC-8183
   adapter); the receipt will exist once the hire runs against a live agent
4. Run the agent leg same-day, fill both columns, move the row into the report
