# Change: Add Venus health-factor signal reader

## Status

Implemented in `packages/signals` (stream S). Live output is pending one input: a real Venus
position address for `VENUS_WATCH_ADDRESS`. Until that address is set, every agent signal falls
back to the fixture catalog, so behavior is identical to the previous build.

## Why

The product spec requires judges to compare agents "using domain signals, not descriptions alone".
Every number currently shown on agent cards is a hand-written fixture. The sprint calendar (Sat 5)
assigns Signal one live reader — "Venus HF and/or Pancake APR reader on featured agents" — so at
least one metric a judge sees comes straight from the chain at request time.

## What

- `packages/signals/src/rpc.ts`: Workers-compatible batch JSON-RPC client plus hex word/address
  decoding helpers (fetch + AbortSignal.timeout only, no Node APIs).
- `packages/signals/src/venus.ts`: reads one address against the Venus Core Pool — comptroller
  `getAssetsIn`, then per market `markets` (collateral factor), `balanceOf`, `borrowBalanceStored`,
  `exchangeRateStored`, and oracle `getUnderlyingPrice`; computes
  `HF = Σ(supply × exchangeRate × price × CF) / Σ(borrow × price)` and an approximate liquidation
  price for single-collateral positions. Selectors are hardcoded after on-chain verification.
  Network target is selectable (`VENUS_NETWORK`); the demo default is BSC testnet — see
  [`use-venus-testnet-position`](../use-venus-testnet-position/proposal.md).
- `packages/signals/src/index.ts`: `getAgentSignal` keeps its synchronous signature (apps/api is
  untouched); a 60-second in-memory cache, background refresh, and fixture fallback on any reader
  failure. Live override activates for `hf-watch` when `VENUS_WATCH_ADDRESS` matches an address
  pattern; no `packages/domain` change — the live signal reuses the existing `health_factor` shape.
- `packages/signals/README.md`: provenance table labeling every metric live vs fixture (Fri 4
  deliverable) plus the reader documentation.

PancakeSwap APR is deliberately deferred: the public Pancake info API rejects requests (403) and
per-market supply-rate reads on mainnet vUSDT/vUSDC returned incoherent values, so no defensible
live APR exists yet. Fixture rows stay labeled as fixtures.

## Owner and tree

Workstream **S** (`fercodes`). Files change only under `packages/signals`. No other workstream tree
is touched; `apps/api/src/app.ts`, `packages/domain`, and `packages/indexer` are read-only
dependencies for this change.

## Verification

- `pnpm -r typecheck` green across all packages.
- Reader primitives validated on-chain for both networks: mainnet vBNB collateral factor 0.80,
  exchange rate matching market totals, oracle BNB ~$750; testnet vBNB collateral factor 0.70,
  exchange rate `1.0364e10` wei/vUnit, oracle $600.00.
- API booted locally: all eight agent signals byte-identical to fixtures without env; with
  `VENUS_WATCH_ADDRESS` set to an address with no Venus market, the live path runs and returns the
  fixture gracefully.

## Rollback plan

Revert the commit: `packages/signals` returns to the one-line pass-through of `@era/indexer`. There
are no schema, route, or fixture changes to undo, so a revert cannot affect Catalog, Commerce, or
Agents. Removing `VENUS_WATCH_ADDRESS` alone also disables the live path without a revert.
