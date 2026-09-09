# Change: Deploy and Register Remaining Seed Agents (Rangekeeper, Yieldrouter, Gridrunner)

## Why

The BNB Agent Studio Hackathon ("Smart Money Era") evaluation rubric explicitly mandates:
> *"Four categories, all first-class... Single-category submissions score poorly. All four, equally deep, is the bar."*
> *"Agent Diversity: All four categories surfaced with equal depth. Agents surfaced on your marketplace must be live on BSC."*

Following the successful public deployment and ERC-8004 identity registration of `hfwatch` (`health_factor`, token ID `2292`), the remaining three seed agents (`rangekeeper`, `yieldrouter`, and `gridrunner`) must also be deployed to public HTTPS edge endpoints and registered on BSC Testnet (chain id 97).

This fulfills task 71 of the sprint plan (`docs/sprint.md`: *"Stretch: Three more agents live on testnet (A)"*) and equips Stream C (Catalog) with real, honest on-chain token IDs and live endpoints across all four marketplace categories.

## What Changes

1. **Rangekeeper (`rebalancing`)**:
   - Deploy `rangekeeper-agent` Cloudflare Worker (`agents/rangekeeper/worker.ts`, `agents/rangekeeper/wrangler.toml`).
   - Probe `/.well-known/agent-card.json` and `/mcp`.
   - Register ERC-8004 identity on BSC Testnet for wallet `0xCC2abE29F43EAb530a6b5D93E3C41bc0E7622b47`.
2. **Yieldrouter (`yield`)**:
   - Deploy `yieldrouter-agent` Cloudflare Worker (`agents/yieldrouter/worker.ts`, `agents/yieldrouter/wrangler.toml`).
   - Probe `/.well-known/agent-card.json` and `/mcp`.
   - Register ERC-8004 identity on BSC Testnet for wallet `0xe1D07be03DDE2C292f842AdE4f34782FDf9176c5`.
3. **Gridrunner (`grid_trading`)**:
   - Deploy `gridrunner-agent` Cloudflare Worker (`agents/gridrunner/worker.ts`, `agents/gridrunner/wrangler.toml`).
   - Probe `/.well-known/agent-card.json` and `/mcp`.
   - Register ERC-8004 identity on BSC Testnet for wallet `0x78f800FBA857Ae0a33eEa55f62a68ddA20b27185`.
4. **Catalog Delivery & Context Ledger**:
   - Format listing facts for all four categories per `agents/LISTING-HANDOFF.md`.
   - Synchronize `agents/CONTEXT.md` and `.antigravity/CONTEXT.md`.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
None (`skip_specs: true` set in `.openspec.yaml` as this change involves operational deployment and on-chain identity minting without altering core spec requirements).

## Impact

- **Owned Path**: `agents/*` only, strictly conforming to `CONTRIBUTING.md` path ownership. No modifications to `apps/web`, `apps/api`, or `packages/indexer/fixtures/`.
- **Dependencies**: `@bnbagent/studio-cli`, `@bnbagent/sdk`, `viem`, `wrangler`.
- **Rollback Plan**: On-chain registrations mint immutable ERC-8004 tokens. If endpoints change in the future, endpoints can be updated using `bag erc8004 update-endpoint --endpoint <url>` without minting duplicate identities.
