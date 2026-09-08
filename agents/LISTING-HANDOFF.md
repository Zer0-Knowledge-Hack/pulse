# Listing handoff: Agents (A) → Catalog (C)

Facts workstream **A** publishes so workstream **C** can list the seed agents.
Covers task 4.4 of
[`scaffold-seed-agents`](../openspec/changes/scaffold-seed-agents/tasks.md).

Catalog is the only stream that edits
`packages/indexer/fixtures/featured.json`. A does not touch it, and A does not
touch `apps/web` at all. This file is the interface between the two.

## Status

**Blocked on registration and deployment, not on agreement.** The four wallets
exist and the four agent projects run locally. No agent is registered on chain
97 yet, and no agent is deployed to a public host, so two of the four required
fields cannot be filled honestly.

| Field | State |
|-------|-------|
| `category` | Ready |
| `owner` | Ready. The keystore address from `studio.toml`. |
| `commerce.erc8183Provider` | Ready. Same address as `owner`; the agent wallet is the ERC-8183 provider. |
| `commerce.x402` | Ready. `true` for all four; `[payments.b402_seller].enabled` is set. |
| `chainId` | Ready. `97`. |
| `erc8004TokenId` | **Pending.** Minted by [`REGISTRATION.md`](./REGISTRATION.md). |
| `endpoints.a2a` / `endpoints.mcp` | **Pending.** Derived from the deployed host. |

Do not paste a placeholder token id into the fixtures to unblock a build. The
current fixture entries already carry invented ids such as `80047`, invented
owners such as `0x4444…4441`, and `https://agents.local/...` endpoints. Those
are Day-0 scaffolding. Replacing them with a second round of invented values
would make the catalog look live while pointing at nothing, which is the same
failure described in issue #8 for the hire path.

## What is ready now

| Agent directory | Catalog `id` | `category` | `owner` and `erc8183Provider` |
|-----------------|--------------|------------|-------------------------------|
| `hfwatch` | `hf-watch` | `health_factor` | `0x6d07BBc31ea6A9d05B323123470Ae2a7955FfCad` |
| `rangekeeper` | `range-keeper` | `rebalancing` | `0xCC2abE29F43EAb530a6b5D93E3C41bc0E7622b47` |
| `yieldrouter` | `yield-router` | `yield` | `0xe1D07be03DDE2C292f842AdE4f34782FDf9176c5` |
| `gridrunner` | `grid-runner` | `grid_trading` | `0x78f800FBA857Ae0a33eEa55f62a68ddA20b27185` |

The `id` column keeps the ids already present in the fixtures, so Catalog
updates four existing records rather than adding four new ones. The other four
fixture entries (`lp-sentinel`, `band-bot`, `apr-hopper`, `liq-guard`) stay as
fixtures. They give each category a second card to compare against, which the
Monday bar requires.

## Endpoint shape once deployed

Registration records a base URL and the runtime derives the protocol paths, so
the fixture values follow from the deployed host with no guesswork:

- `endpoints.a2a` is `<host>/.well-known/agent-card.json`
- `endpoints.mcp` is `<host>/mcp`

Both must be absolute URLs. The domain schema rejects anything that is not a
valid URL, and it allows `null` if an agent has no endpoint for a protocol.

## Delivery format

`agents/scripts/register-erc8004.ts` prints this block when registration
succeeds. Paste the values into the matching fixture record:

```json
{
  "agent": "hfwatch",
  "category": "health_factor",
  "chainId": 97,
  "erc8004TokenId": "<agent_id from registration>",
  "owner": "0x6d07BBc31ea6A9d05B323123470Ae2a7955FfCad",
  "endpoints": {
    "a2a": "https://<deployed-host>/.well-known/agent-card.json",
    "mcp": "https://<deployed-host>/mcp"
  }
}
```

Set `live` to `true` only for agents whose endpoint actually answers. An agent
that is registered but not reachable should stay `live: false` so the demo
does not send a judge into a dead end.

## Verifying a handoff without the keystore

Catalog can confirm a token id independently once it exists. The read-only
lookup by wallet address resolves an address to its `agent_id`, so C does not
have to trust a number pasted into a document.

## Next step

[Registration runbook](./REGISTRATION.md) · [Agent roster](./README.md) · [Sprint plan](../docs/sprint.md)
