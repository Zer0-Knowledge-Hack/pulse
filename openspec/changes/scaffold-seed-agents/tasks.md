## 1. Workstream Claim & Documentation

- [x] 1.1 Update `docs/sprint.md` assigning `moises-cisneros` to Workstream A
- [x] 1.2 Record `scaffold-seed-agents` in `docs/DECISIONS.md` under `agents/seed-studio-agents`

## 2. Agent Projects Scaffolding

- [x] 2.1 Scaffold `agents/hfwatch` (`health_factor`) with `bag init`
- [x] 2.2 Scaffold `agents/rangekeeper` (`rebalancing`) with `bag init`
- [x] 2.3 Scaffold `agents/yieldrouter` (`yield`) with `bag init`
- [x] 2.4 Scaffold `agents/gridrunner` (`grid_trading`) with `bag init`

## 3. Agent Configuration & Workspace Verification

- [x] 3.1 Verify `studio.toml` settings (runtime `agentcore`, A2A/MCP/X402 protocols, dual commerce rails) across all 4 agents
- [x] 3.2 Update `agents/README.md` with project roster and category mapping
- [x] 3.3 Verify monorepo typecheck integrity (`pnpm typecheck`)

## 4. Testnet Identity & Fixtures Handoff

- [x] 4.1 Generate local keystores for all 4 agents (`bag wallet new`)
- [x] 4.2 Verify local runtime execution and negotiation (`bag dev --port ...`, `/ping`, agent card, A2A `negotiate` EIP-191 signing)
- [ ] 4.3 Prepare ERC-8004 registration procedure for BSC Testnet (chain id 97)
- [ ] 4.4 Provide listing facts (`tokenId`, endpoint, category) to Catalog for `packages/indexer/fixtures/featured.json`
