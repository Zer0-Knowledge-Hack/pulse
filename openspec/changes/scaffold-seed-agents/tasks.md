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
- [x] 4.3 Prepare ERC-8004 registration procedure for BSC Testnet (chain id 97) — runbook in `agents/REGISTRATION.md`, script in `agents/scripts/register-erc8004.ts`
- [ ] 4.4 Provide listing facts (`tokenId`, endpoint, category) to Catalog for `packages/indexer/fixtures/featured.json` — format and the ready fields are in `agents/LISTING-HANDOFF.md`; `erc8004TokenId` and endpoints stay blocked

## 5. Blockers on 4.4

- [ ] 5.1 Deploy each agent to a public host (registration writes that host on-chain, so it must exist first)
- [ ] 5.2 Run the registration to mint the four `agent_id` values on chain 97
- [ ] 5.3 Hand the ids and endpoints to Catalog

These steps need the agents' keystores, which live only on the machine
that ran `bag wallet new` and are gitignored. Nobody else can complete them.
