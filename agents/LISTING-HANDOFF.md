# Listing handoff: Agents (A) → Catalog (C)

Facts workstream **A** publishes so workstream **C** can list the seed agents.
Covers task 4.4 of
[`scaffold-seed-agents`](../openspec/changes/scaffold-seed-agents/tasks.md).

Catalog is the only stream that edits
`packages/indexer/fixtures/featured.json`. A does not touch it, and A does not
touch `apps/web` at all. This file is the interface between the two.

## Status

**Deployed and registered on BSC testnet (chain id 97).** All four seed agents
have public Cloudflare Worker hosts and ERC-8004 identities (PRs #20 and #22).
Catalog still must write these facts into `featured.json` — tracked as
[issue #26](https://github.com/Zer0-Knowledge-Hack/pulse/issues/26). Until that
lands, fixture Day-0 placeholders (`80041`…`80048`, `https://agents.local/...`)
remain on `main` and must not be trusted as live.

| Field | State |
|-------|-------|
| `category` | Ready |
| `owner` | Ready. The keystore address from `studio.toml`. |
| `commerce.erc8183Provider` | Ready. Same address as `owner`; the agent wallet is the ERC-8183 provider. |
| `commerce.x402` | Ready. `true` for all four; `[payments.b402_seller].enabled` is set. |
| `chainId` | Ready. `97`. |
| `erc8004TokenId` | Ready. Minted on chain 97 (see delivery blocks below). |
| `endpoints.a2a` / `endpoints.mcp` | Ready. Absolute URLs from the deployed Workers (see below). Probe before setting `live: true`. |

Do not invent token ids or endpoints. The values below were recorded by A at
deploy/register time (`openspec/changes/deploy-register-hfwatch/tasks.md`,
`openspec/changes/deploy-register-remaining-agents/tasks.md`). Replacing Day-0
scaffolding with a second round of invented values would make the catalog look
live while pointing at nothing.

## What is ready now

| Agent directory | Catalog `id` | `category` | `owner` and `erc8183Provider` | ERC-8004 token id |
|-----------------|--------------|------------|-------------------------------|-------------------|
| `hfwatch` | `hf-watch` | `health_factor` | `0x6d07BBc31ea6A9d05B323123470Ae2a7955FfCad` | `2292` |
| `rangekeeper` | `range-keeper` | `rebalancing` | `0xCC2abE29F43EAb530a6b5D93E3C41bc0E7622b47` | `2300` |
| `yieldrouter` | `yield-router` | `yield` | `0xe1D07be03DDE2C292f842AdE4f34782FDf9176c5` | `2301` |
| `gridrunner` | `grid-runner` | `grid_trading` | `0x78f800FBA857Ae0a33eEa55f62a68ddA20b27185` | `2302` |

The `id` column keeps the ids already present in the fixtures, so Catalog
updates four existing records rather than adding four new ones. The other four
fixture entries (`lp-sentinel`, `band-bot`, `apr-hopper`, `liq-guard`) stay as
fixtures. They give each category a second card to compare against. Do not
replace their invented identity fields with more invented values.

## Endpoint shape

Registration records a base URL and the runtime derives the protocol paths:

- `endpoints.a2a` is `<host>/.well-known/agent-card.json`
- `endpoints.mcp` is `<host>/mcp`

Both must be absolute URLs. The domain schema rejects anything that is not a
valid URL, and it allows `null` if an agent has no endpoint for a protocol.

Set `live` to `true` only after probing: `GET` the A2A card returns 200 with the
agent card, and `/mcp` responds as an MCP endpoint. An agent that is registered
but not reachable should stay `live: false`.

## Delivery blocks (paste into featured.json)

```json
{
  "agent": "hfwatch",
  "category": "health_factor",
  "chainId": 97,
  "erc8004TokenId": "2292",
  "owner": "0x6d07BBc31ea6A9d05B323123470Ae2a7955FfCad",
  "endpoints": {
    "a2a": "https://hfwatch-agent.moisescisnerosdl.workers.dev/.well-known/agent-card.json",
    "mcp": "https://hfwatch-agent.moisescisnerosdl.workers.dev/mcp"
  }
}
```

```json
{
  "agent": "rangekeeper",
  "category": "rebalancing",
  "chainId": 97,
  "erc8004TokenId": "2300",
  "owner": "0xCC2abE29F43EAb530a6b5D93E3C41bc0E7622b47",
  "endpoints": {
    "a2a": "https://rangekeeper-agent.moisescisnerosdl.workers.dev/.well-known/agent-card.json",
    "mcp": "https://rangekeeper-agent.moisescisnerosdl.workers.dev/mcp"
  }
}
```

```json
{
  "agent": "yieldrouter",
  "category": "yield",
  "chainId": 97,
  "erc8004TokenId": "2301",
  "owner": "0xe1D07be03DDE2C292f842AdE4f34782FDf9176c5",
  "endpoints": {
    "a2a": "https://yieldrouter-agent.moisescisnerosdl.workers.dev/.well-known/agent-card.json",
    "mcp": "https://yieldrouter-agent.moisescisnerosdl.workers.dev/mcp"
  }
}
```

```json
{
  "agent": "gridrunner",
  "category": "grid_trading",
  "chainId": 97,
  "erc8004TokenId": "2302",
  "owner": "0x78f800FBA857Ae0a33eEa55f62a68ddA20b27185",
  "endpoints": {
    "a2a": "https://gridrunner-agent.moisescisnerosdl.workers.dev/.well-known/agent-card.json",
    "mcp": "https://gridrunner-agent.moisescisnerosdl.workers.dev/mcp"
  }
}
```

`commerce.erc8183Provider` equals `owner` for each row. Hosts were recorded at
deploy time in PRs #20/#22 and the OpenSpec task ledgers above.

## Verifying a handoff without the keystore

Catalog can confirm a token id independently once it exists. The read-only
lookup by wallet address resolves an address to its `agent_id`, so C does not
have to trust a number pasted into a document. Before `live: true`, probe the
A2A and MCP URLs above.

## Next step

[Issue #26](https://github.com/Zer0-Knowledge-Hack/pulse/issues/26) (Catalog
writes fixtures) · [Registration runbook](./REGISTRATION.md) · [Agent roster](./README.md) · [Sprint plan](../docs/sprint.md)
