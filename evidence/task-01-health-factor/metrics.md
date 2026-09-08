# Task 1 metrics — Health-factor monitoring

Status as of 2026-09-06: **dry-run pair incomplete** — DIY leg recorded (rail `dry-run`),
agent leg pending a live hfwatch endpoint (workstream A) and, for the preferred rail, testnet
hire (workstream H). Nothing below counts as an agent-advantage datapoint until both legs run on
the funded team position (see `evidence/README.md` honesty rule).

## Comparison target (frozen by protocol.md)

| Dimension | Agent leg (`hf-watch` via marketplace) | DIY leg |
|-----------|----------------------------------------|---------|
| Task | HF + collateral/borrow + breakdown + verdict for the given address | identical |
| Cost | hire price in $U recorded from the real job receipt | 0 tokens; human time |
| Time | wall-clock from "hire clicked" to validated output | wall-clock of the manual procedure |

## Current standings (dry-run only, do not cite as final)

| Dimension | Agent | DIY | Notes |
|-----------|-------|-----|-------|
| Time | _pending_ | machine: 1.3 s scripted; human: est. 20–35 min first run | DIY scripted DIY is the *strong* lower bound the agent must beat — a human by-hand is far slower |
| Cost | _pending_ (target ≤ 0.01 $U hire) | 0 | |
| Output quality | _pending_ | verdict `n/a` on this input; no breakdown; no replayability | the DIY output is honest but context-free |

## Quality rubric used for the verdict section

- `safe` HF ≥ 3 · `sharpen caps` 3 > HF ≥ 1.5 · `act now` HF < 1.5
- breakdown required per entered market; missing verdicts disqualify the leg
- provenance: raw outputs must be attached unedited (one file per leg)

## To do to convert this into a TermiX-countable row

1. Fund the watch wallet + create the Venus testnet position (blocker recorded in
   `openspec/changes/use-venus-testnet-position/proposal.md`)
2. Workstream A: deploy hfwatch, hand over endpoint + ERC-8004 registration
3. Workstream H (owner unclaimed): testnet hire for the agent leg receipt (mock rail acceptable,
   labeled)
4. Re-run both legs same-day against the funded position; fill both columns
