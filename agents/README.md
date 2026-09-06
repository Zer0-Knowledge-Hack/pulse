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

## Next Steps for Workstream A

1. In `app/agent` for each agent, run `bag wallet new` to generate its dedicated local keystore EOA.
2. Register on-chain under ERC-8004 via `bag erc8004 register` (or `@bnbagent/sdk` with MegaFuel paymaster sponsorship).
3. Publish verified `tokenId`, `endpoint`, and category into `packages/indexer/fixtures/featured.json` for Catalog.

