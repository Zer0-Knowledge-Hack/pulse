# @era/signals

Signal readers for the pulse marketplace. Owned by workstream **S**. The API serves signals from
`GET /agents/:id/signal`, and the web widgets in `apps/web/src/features/signals/` render them.

## How it works

`getAgentSignal(agentId)` resolves a signal for an agent id. The base source is the fixture catalog
in `@era/indexer` (`packages/indexer/fixtures/featured.json`). On top of that, live on-chain readers
override the fixture values when they succeed. Results are cached in memory for 60 seconds; on any
reader failure the endpoint falls back to the fixture signal, so the marketplace never breaks
because an RPC is down.

## Provenance of every metric

| Agent | Category | Metrics | Source |
|-------|----------|---------|--------|
| `hf-watch` | health_factor | `healthFactor`, `liquidationPrice` | **Live** — Venus Core Pool (BSC mainnet) position reader, active when `VENUS_WATCH_ADDRESS` is set; fixture otherwise |
| `hf-watch` | health_factor | `lastActionAt` | Fixture (agent's last recorded action) |
| `hf-watch` | health_factor | `protocol` | Constant `"Venus"` |
| `liq-guard` | health_factor | all | Fixture |
| `apr-hopper` | yield | all | Fixture |
| `yield-router` | yield | all | Fixture |
| `grid-runner` | grid_trading | all | Fixture |
| `band-bot` | grid_trading | all | Fixture |
| `range-keeper` | rebalancing | all | Fixture |
| `lp-sentinel` | rebalancing | all | Fixture |

A PancakeSwap V3 pool APR reader and a Venus supply-APR reader are deliberately not shipped yet:
the public Pancake info API rejects requests (403), and per-market `supplyRatePerBlock` reads on
mainnet vUSDT/vUSDC returned incoherent values, so we cannot publish a defensible live APR. Fixture
numbers stay labeled as fixtures until a reader can be validated.

## Venus position reader

`src/venus.ts` computes the health factor of one BSC mainnet address against the Venus Core Pool:

- Comptroller (diamond): `0xfD36E2c2a6789Db23113685031d7F16329158384`
- Oracle: `0x6592b5de802159f3e74b2486b091d11a8256ab8a`
- `getAssetsIn` lists the entered markets; for each market it reads `markets` (collateral factor),
  `balanceOf`, `borrowBalanceStored`, `exchangeRateStored`, and the oracle `getUnderlyingPrice`.
- `HF = Σ(supply × exchangeRate × price × collateralFactor) / Σ(borrow × price)`
- `liquidationPrice = price / HF`, only when the position has exactly one collateral market
  (otherwise `0`).
- Health factor is capped at 999 (supply-only positions).

Enable it locally:

```bash
VENUS_WATCH_ADDRESS=0xyourPositionAddress pnpm --filter @era/api dev
```

Selectors are hardcoded after on-chain verification; the exchange-rate formula
(`underlying = vTokenBalance × exchangeRateStored / 1e18`) was validated against the vBNB market
totals. No `packages/domain` change is required: the reader returns the same
`health_factor` signal shape as the fixtures.
