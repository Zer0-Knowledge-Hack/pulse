# Evidence

Owned by workstream **S** (`fercodes`). This directory holds the artifacts behind the TermiX
**Agent Advantage Report** — the mandatory submission for the TermiX partner track of the BNB Chain
"Build the Era" hackathon (submission without it is disqualified).

## What the report must contain (TermiX track spec)

1. At least **3 real tasks**, each executed twice: once by **hiring an agent through this
   marketplace** and once done **without an agent (DIY)**.
2. For every task: **time spent, cost, and output quality**, plus the **actual outputs attached**.
3. At least one task must come from **trading, equities, or security**.

TermiX judges "proven agent advantage" (30% of their rubric) against this report; service value
(30%) likewise calls for agents worth hiring. No TermiX integration is required — they will hire
from our marketplace themselves during judging.

## Collection protocol

- Every run lives in its own folder `task-NN-<name>/` with:
  - `protocol.md` — the identical task definition both legs execute (frozen before running)
  - `diy/` — the no-agent run: raw outputs attached, unedited
  - `agent/` — the hire receipt (through `POST /jobs`) and the agent's raw output
  - `metrics.md` — time, cost, output quality comparison
- **Honesty rule:** every run is labeled with its rail. `live` = execution against a deployed
  agent; `testnet` = on-chain escrow job on BSC testnet; `mock` = mock commerce adapter. A run
  performed with standalone tooling (no agent, no marketplace rail) is a `dry-run` and must be
  labeled as such — a dry-run can be a procedure rehearsal, never an agent-advantage datapoint.
- Final measured pairs (agent vs DIY on the same input) only count once both legs ran on the same
  receiver/position with the marketplace rail involved.
- Costs are in USD or tokens; a mock-run cost of 0 is recorded as `mock (0)`.

## Status

| Task | Category | Agent leg | DIY leg | State |
|------|----------|-----------|---------|-------|
| Task 1 — health-factor monitoring | health_factor | pending live hfwatch endpoint (A) | dry-run recorded | protocol + DIY recorded 2026-09-06 |
| Task 2 — _planned_ | _open_ | — | — | outline only |
| Task 3 — must be trading/equities/security (hard TermiX requirement) | _open_ | — | — | outline only |

Regulation source: BNB Chain Smart Money Era hackathon page, TermiX partner-track section, and
TermiX's own campaign page (`agent.family/campaigns/bnb-build-the-era`).
