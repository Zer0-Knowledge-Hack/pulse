# Change: Deploy hfwatch and Register ERC-8004 Identity

## Why

Workstream **A** (Agents, owned by `moises-cisneros` in `agents/*`) is responsible for providing four live/fixture DeFi agents for the pulse marketplace. While the four agent projects run locally and hold keystores in `agents/<agent>/.studio/wallets/`, none are yet deployed to a public HTTPS endpoint or registered on BSC Testnet (chain id 97).

Completing the deployment and on-chain registration of `hfwatch` resolves GitHub [Issue #18](https://github.com/Zer0-Knowledge-Hack/pulse/issues/18) and completes task 4.4 and Section 5 of `scaffold-seed-agents`. This unblocks Stream **S** (evidence generation for the TermiX Agent Advantage track) and provides Stream **C** (Catalog) with authentic `erc8004TokenId` and live endpoints (`/.well-known/agent-card.json` and `/mcp`) to replace temporary Day-0 fixture values.

## What Changes

- Deploy `agents/hfwatch` to a publicly accessible HTTPS host (e.g. Cloudflare Workers / server host) exposing:
  - `GET https://<host>/.well-known/agent-card.json` (returning the A2A agent card).
  - `POST/GET https://<host>/mcp` (responding as an MCP endpoint).
- Run on-chain ERC-8004 identity registration on BSC Testnet (chain id 97) via `agents/scripts/register-erc8004.ts` using the local `hfwatch` keystore (`0x6d07BBc31ea6A9d05B323123470Ae2a7955FfCad`).
- Extract the resulting `agent_id` (`erc8004TokenId`) and live endpoints formatted per `agents/LISTING-HANDOFF.md`.
- Post the delivery block to GitHub Issue #18 to complete handoff to Catalog (Stream C) without violating workstream boundaries (Workstream A publishes facts, Catalog updates fixtures).

## Capabilities

### New Capabilities
None.

### Modified Capabilities
None (`skip_specs: true` set in `.openspec.yaml` as this change involves operational deployment and on-chain identity minting without altering core spec requirements).

## Impact

- **Owned Path**: `agents/*` only, strictly conforming to `CONTRIBUTING.md` path ownership. No modifications to `apps/web`, `apps/api`, or `packages/indexer/fixtures/`.
- **Dependencies**: `@bnbagent/studio-cli`, `@bnbagent/sdk`, `viem`.
- **Rollback Plan**: ERC-8004 registrations on BSC Testnet are immutable identity tokens. If an incorrect endpoint is registered, the on-chain endpoint can be amended using `bag erc8004 update-endpoint --endpoint <url>` without creating duplicate token identities.
