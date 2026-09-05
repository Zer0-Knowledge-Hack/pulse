# Change: Scaffold Seed Studio Agents

## Why

Workstream **A** (Agents, owned by `moises-cisneros` in `agents/*`) is responsible for providing four live/fixture DeFi agents for the pulse marketplace before the Monday 7 Sep freeze checkpoint. Currently, `agents/` only contains a README stub.

Scaffolding these agents using the official BNB Agent Studio CLI (`@bnbagent/studio-cli`) ensures compliance with BNB Chain hackathon standards, provides working A2A, MCP, and X402 endpoints, and sets up ERC-8004 identity registration on BSC Testnet (chain id 97).

## What Changes

- Scaffold four category-native BNB Agent Studio projects in `agents/`:
  - `agents/hfwatch`: Health-factor monitoring for Venus / Lista collateral.
  - `agents/rangekeeper`: PancakeSwap V3 liquidity range rebalancing.
  - `agents/yieldrouter`: Cross-venue yield optimizer for Lista and Venus.
  - `agents/gridrunner`: 12-level grid trading strategy with spend caps.
- Configure each project with `runtime = "agentcore"`, `protocols = ["A2A", "MCP", "X402"]`, and `pieverse-llm` default free model.
- Configure dual commerce rails: ERC-8183 escrow in `$U` (token `0xc70B8741B8B07A6d61E54fd4B20f22Fa648E5565`) and B402 micropayments.
- Provide instructions and registration script for ERC-8004 identity on BSC Testnet (chain id 97).
- Update `agents/README.md` with the project roster and category mappings for Catalog handoff.

## Capabilities

### Modified Capabilities

- `specs/stack`: Specify the seed agent runtime configuration, dual commerce rails, and local key generation workflow for the four categories.

## Impact

- **Owned Path**: `agents/*` only. Does not touch `apps/web`, `apps/api`, or other workstream packages.
- **Dependencies**: `@bnbagent/studio-cli` (installed globally or via npx), `@bnbagent/sdk`.
- **Rollback Plan**: If any agent scaffold causes issues, the agent directory under `agents/<name>` can be removed or re-scaffolded independently without impacting the monorepo build or existing packages.
