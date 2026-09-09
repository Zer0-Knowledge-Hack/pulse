# Listing handoff: Agents (A) → Catalog (C)

Facts workstream **A** publishes so workstream **C** can list the seed agents.
Covers task 4.4 of
[`scaffold-seed-agents`](../openspec/changes/scaffold-seed-agents/tasks.md).

Catalog is the only stream that edits
`packages/indexer/fixtures/featured.json`. A does not touch it, and A does not
touch `apps/web` at all. This file is the interface between the two.

## Status

**Ready and Delivered.** All four seed agents are deployed to public Cloudflare
Workers edge endpoints and registered on BSC Testnet (Chain ID 97) with MegaFuel
sponsored gas. All endpoints have been probed and confirmed responding with
HTTP 200 OK.

| Field | State |
|-------|-------|
| `category` | Ready |
| `owner` | Ready. The keystore address from `studio.toml`. |
| `commerce.erc8183Provider` | Ready. Same address as `owner`; the agent wallet is the ERC-8183 provider. |
| `commerce.x402` | Ready. `true` for all four; `[payments.b402_seller].enabled` is set. |
| `chainId` | Ready. `97`. |
| `erc8004TokenId` | **Ready.** Minted on BSC Testnet (`2292`, `2300`, `2301`, `2302`). |
| `endpoints.a2a` / `endpoints.mcp` | **Ready.** Live on Cloudflare Workers edge. |

## Live Seed Agents Roster

| Agent directory | Catalog `id` | `category` | `owner` and `erc8183Provider` | ERC-8004 Token ID | Deployed Endpoint |
|-----------------|--------------|------------|-------------------------------|-------------------|-------------------|
| `hfwatch` | `hf-watch` | `health_factor` | `0x6d07BBc31ea6A9d05B323123470Ae2a7955FfCad` | **`2292`** | `https://hfwatch-agent.moisescisnerosdl.workers.dev` |
| `rangekeeper` | `range-keeper` | `rebalancing` | `0xCC2abE29F43EAb530a6b5D93E3C41bc0E7622b47` | **`2300`** | `https://rangekeeper-agent.moisescisnerosdl.workers.dev` |
| `yieldrouter` | `yield-router` | `yield` | `0xe1D07be03DDE2C292f842AdE4f34782FDf9176c5` | **`2301`** | `https://yieldrouter-agent.moisescisnerosdl.workers.dev` |
| `gridrunner` | `grid-runner` | `grid_trading` | `0x78f800FBA857Ae0a33eEa55f62a68ddA20b27185` | **`2302`** | `https://gridrunner-agent.moisescisnerosdl.workers.dev` |

The `id` column keeps the ids already present in the fixtures, so Catalog
updates four existing records rather than adding four new ones. The other four
fixture entries (`lp-sentinel`, `band-bot`, `apr-hopper`, `liq-guard`) stay as
fixtures. They give each category a second card to compare against, which the
Monday bar requires.

## Verified Delivery Payload for Catalog (Stream C)

Catalog (`packages/indexer/fixtures/featured.json`) can directly incorporate the
following verified facts for the four live registered agents:

```json
[
  {
    "agent": "hf-watch",
    "category": "health_factor",
    "chainId": 97,
    "erc8004TokenId": "2292",
    "owner": "0x6d07BBc31ea6A9d05B323123470Ae2a7955FfCad",
    "endpoints": {
      "a2a": "https://hfwatch-agent.moisescisnerosdl.workers.dev/.well-known/agent-card.json",
      "mcp": "https://hfwatch-agent.moisescisnerosdl.workers.dev/mcp"
    }
  },
  {
    "agent": "range-keeper",
    "category": "rebalancing",
    "chainId": 97,
    "erc8004TokenId": "2300",
    "owner": "0xCC2abE29F43EAb530a6b5D93E3C41bc0E7622b47",
    "endpoints": {
      "a2a": "https://rangekeeper-agent.moisescisnerosdl.workers.dev/.well-known/agent-card.json",
      "mcp": "https://rangekeeper-agent.moisescisnerosdl.workers.dev/mcp"
    }
  },
  {
    "agent": "yield-router",
    "category": "yield",
    "chainId": 97,
    "erc8004TokenId": "2301",
    "owner": "0xe1D07be03DDE2C292f842AdE4f34782FDf9176c5",
    "endpoints": {
      "a2a": "https://yieldrouter-agent.moisescisnerosdl.workers.dev/.well-known/agent-card.json",
      "mcp": "https://yieldrouter-agent.moisescisnerosdl.workers.dev/mcp"
    }
  },
  {
    "agent": "grid-runner",
    "category": "grid_trading",
    "chainId": 97,
    "erc8004TokenId": "2302",
    "owner": "0x78f800FBA857Ae0a33eEa55f62a68ddA20b27185",
    "endpoints": {
      "a2a": "https://gridrunner-agent.moisescisnerosdl.workers.dev/.well-known/agent-card.json",
      "mcp": "https://gridrunner-agent.moisescisnerosdl.workers.dev/mcp"
    }
  }
]
```

All four endpoints have passed automated HTTP probing (`curl` to `/.well-known/agent-card.json` and `/mcp` returning HTTP 200 OK). They are ready for `live: true`.

## Verifying a handoff without the keystore

Catalog can confirm a token id independently once it exists. The read-only
lookup by wallet address resolves an address to its `agent_id`, so C does not
have to trust a number pasted into a document.

## Next step

[Registration runbook](./REGISTRATION.md) · [Agent roster](./README.md) · [Sprint plan](../docs/sprint.md)
