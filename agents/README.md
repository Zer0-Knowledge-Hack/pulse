# Seed agents

Owned by workstream **A** (`moises-cisneros`). BNB Agent Studio projects are maintained here (`bag` CLI).

## Project Roster

Four seed agents scaffolded with BNB Agent Studio (`@bnbagent/studio-cli`), matching the four marketplace categories:

| Agent Directory | Category | Project Name | Description & DeFi Target |
|---|---|---|---|
| [`hfwatch/`](./hfwatch) | `health_factor` | `hfwatch-agent` | Monitors Venus collateral health factor and liquidation risk on BSC Testnet. |
| [`rangekeeper/`](./rangekeeper) | `rebalancing` | `rangekeeper-agent` | Automated liquidity range rebalancing for PancakeSwap V3. |
| [`yieldrouter/`](./yieldrouter) | `yield` | `yieldrouter-agent` | Dynamically routes and allocates stable yields across Lista and Venus. |
| [`gridrunner/`](./gridrunner) | `grid_trading` | `gridrunner-agent` | 12-level grid trading strategy on BNB/USDT with spend caps. |

## Standards & Configuration

- **Runtime**: `agentcore` with `A2A`, `MCP`, and `X402` protocol faces.
- **LLM Provider**: `pieverse-llm` (model: `auto/free`).
- **Payments / Commerce**: Dual rails (`both`): ERC-8183 escrow in `$U` and B402 micropayments.
- **Network**: BSC Testnet (`chainId: 97`).

## Wallets

Each agent holds its own keystore EOA, generated with `bag wallet new` and
recorded in its `studio.toml`. One wallet owns at most one ERC-8004 identity,
which is why there are four. The keystores live under `.studio/` in each agent
workspace and are gitignored, so only the machine that created them can sign.

| Agent | Wallet address |
|-------|----------------|
| `hfwatch` | `0x6d07BBc31ea6A9d05B323123470Ae2a7955FfCad` |
| `rangekeeper` | `0xCC2abE29F43EAb530a6b5D93E3C41bc0E7622b47` |
| `yieldrouter` | `0xe1D07be03DDE2C292f842AdE4f34782FDf9176c5` |
| `gridrunner` | `0x78f800FBA857Ae0a33eEa55f62a68ddA20b27185` |

## Next Steps for Workstream A

1. Deploy each agent so it answers on a public host. Registration records that
   host on-chain, so it has to exist first.
2. Register each agent under ERC-8004 on chain 97. Runbook and script:
   [`REGISTRATION.md`](./REGISTRATION.md).
3. Hand the token ids and endpoints to Catalog through
   [`LISTING-HANDOFF.md`](./LISTING-HANDOFF.md). Workstream A does not edit
   `packages/indexer/fixtures/featured.json`; Catalog owns that file.

## Operator scripts

[`scripts/`](./scripts) is a standalone pnpm workspace, deliberately outside the
root workspace (`apps/*`, `packages/*`) so the studio runtime never enters the
app build or CI install.

