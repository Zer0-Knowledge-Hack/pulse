# Task 1 protocol — Health-factor monitoring

Frozen 2026-09-06 before any leg runs. Both legs execute the identical task so the comparison is
timing/cost/quality only.

## Task definition (identical for both legs)

Given one Venus Protocol Core Pool position address on BSC:

1. Report the **current health factor** (collateral-weighted / borrowed per Venus comptroller
   accounting).
2. Report **collateral value** (USD) and **total borrow value** (USD).
3. Report the **per-market breakdown** (one row per entered vToken market: market, supply USD,
   borrow USD, collateral factor).
4. Issue an **action verdict**: `safe` (HF ≥ 3), `sharpen caps` (3 > HF ≥ 1.5), or
   `act now` (HF < 1.5). Cite the value used.

Accepted output format: one document/JSON containing all four sections. No narrative padding.

## Agent leg (rail to be recorded on run)

1. Hire `HF Watch` (`hf-watch`) from the marketplace browse page → detail → hire CTA.
2. Rail: BSC testnet ERC-8183 escrow via `POST /jobs` (or `mock` adapter if testnet hire is not
   yet live; label honestly).
3. Task input sent to the agent: the watched position address + the section list above.
4. Save the hire receipt (job id, tx hashes) and the agent's raw output under `agent/`.

## DIY leg (no agent, marketplace not involved)

A competent DeFi user, no special tooling, does the same task by hand:

1. Open the position address on the block explorer; check its token holdings for vTokens.
2. For each vToken: look up the market page to identify the underlying and decimals.
3. Fetch exchange rates and the Venus oracle prices (via UI or explorer reads).
4. Look up each market's collateral factor (comptroller `markets`).
5. Compute supply value, borrow value, health factor by hand; write the breakdown and verdict.

The DIY run records which of these steps is actually feasible by hand in practice, the time
taken, and the outputs produced — unedited, with any errors left in place.

## Honesty notes

- The team watch position (`0x22f3e24233B9BDcC65fa855495D99Fe7d2458510`) is funded later; until
  then both legs run as a **dry-run against a representative address** and the final measured pair
  is re-recorded once the position exists.
- A dry-run never counts as an agent-advantage datapoint (see `evidence/README.md`).
