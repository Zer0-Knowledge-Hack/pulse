# Change: Target Venus BSC testnet for the health-factor reader demo

## Status

Decided — the Venus position reader in `packages/signals` targets the **BSC testnet Core Pool** by
default (`VENUS_NETWORK=testnet`), and the demo watch position is a single-market vBNB position
(supply + borrow BNB) created by the team with faucet funds. Mainnet constants stay available via
`VENUS_NETWORK=mainnet` for a later upgrade.

**Pending work blocker (recorded 2026-09-06):** the reader, cache, fallback, and decision records
are shipped on `feat/venus-hf-reader`, but the live number is waiting on testnet funds:

- Watch wallet generated and waiting for funds:
  `0x22f3e24233B9BDcC65fa855495D99Fe7d2458510`. The private key lives only in the operator's local
  scratch storage (`/tmp/opencode/position/throwaway.key`); it is never committed. Discard the key
  after Wed 9 Sep.
- Funding is blocked by faucet gates: the official faucet, QuickNode, and Chainstack all require a
  mainnet balance (~0.002 BNB), a login, or an API key, so a fresh empty wallet is silently
  rejected. Untried self-serve route: Telegram support bot `@bnbchain_official_bot` (message the
  wallet address, 0.3 tBNB/day). Fastest option is likely a teammate (workstream A needs tBNB for
  agent registration on chain 97) sending 0.05–0.45 tBNB directly.
- Once funded, remaining steps for Signal: run the three-call recipe below against the funded
  wallet (mint → enterMarkets → borrow, ~few minutes), bake the address as the default
  `VENUS_WATCH_ADDRESS`, confirm `GET /agents/hf-watch/signal` serves the live health factor,
  commit to `feat/venus-hf-reader`, then run the full web demo check to close Sat 5.


## Why

- Cost: a mainnet position needs ~0.05 BNB (~$37) plus gas. A testnet position needs only faucet
  tokens. The product spec treats testnet as acceptable ("testnet acceptable, mainnet stronger"),
  and workstream A's `hfwatch` agent already targets Venus on BSC testnet, so data and agent story
  stay consistent.
- We exhaustively searched for an existing mainnet Venus position to watch (whale wallets,
  protocol vaults, event-log scans across public RPCs): none findable. Any address the team would
  use on mainnet would have to be newly funded, which costs real money.

## What

- `packages/signals/src/venus.ts` exposes both networks and selects via `VENUS_NETWORK`
  (empty/unset → `testnet`; unknown values throw and the caller falls back to fixtures):
  - testnet comptroller `0x94d1820b2D1c7c7452A163983Dc888CEC546b77D`
  - testnet oracle `0x3cd69251d04a28d887ac14cbe2e14c52f3d57823`
  - testnet RPC `https://bsc-testnet-rpc.publicnode.com`
- Demo position recipe (stream S or A wallet, faucet-funded):
  1. get tBNB from the official BNB Chain testnet faucet
  2. `vBNB.mint()` (testnet vBNB `0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c`) with ~0.4 tBNB
  3. `comptroller.enterMarkets([vBNB])`
  4. `vBNB.borrow()` 0.14 tBNB → resulting HF ≈ (0.4 × 0.7) / 0.14 = 2.0
  5. send the wallet address as `VENUS_WATCH_ADDRESS` to Signal
- Constraint learned the hard way: the testnet oracle prices for vUSDT ($5e11) and vUSDC ($1e12)
  are mis-scaled, so the demo position must stay inside the vBNB market where the oracle reads a
  clean $600. Do not borrow testnet stables for this demo until Venus fixes those feeds.

## Verification

Testnet reader checks all pass: `markets(vBNB)` collateral factor 0.70, exchange rate
`1.0364e10` wei per vUnit, oracle price $600.00, and an address with no Venus market returns
`null` cleanly (fixture fallback). API serves byte-identical fixtures while
`VENUS_WATCH_ADDRESS` is unset.

## Owner and tree

Workstream **S** (`fercodes`). Change touches `packages/signals` and decision-record files only.

## Rollback plan

Set `VENUS_NETWORK=mainnet` (constants already in code) once a mainnet position exists; or pin a
position-only revert by removing `VENUS_WATCH_ADDRESS` and returning to pure fixtures. No schema,
route, or fixture changes are involved.

## Engram

Topic key `signals/venus-testnet-position` (upsert; see `docs/DECISIONS.md`). Mirror pending —
OpenSpec is the source of truth if Engram is unavailable.
