## 1. Rangekeeper Deployment & Registration (Rebalancing)

- [x] 1.1 Create `agents/rangekeeper/wrangler.toml` and `worker.ts` exposing A2A Agent Card and MCP
- [x] 1.2 Deploy `rangekeeper-agent` to Cloudflare Workers (`bunx wrangler deploy`)
- [x] 1.3 Probe live endpoints on `https://rangekeeper-agent.<account>.workers.dev` (card, mcp, ping)
- [x] 1.4 Register ERC-8004 identity on BSC Testnet for wallet `0xCC2abE29F43EAb530a6b5D93E3C41bc0E7622b47`
- [x] 1.5 Record minted `agent_id` token ID (`2300`)

## 2. Yieldrouter Deployment & Registration (Yield Optimisation)

- [x] 2.1 Create `agents/yieldrouter/wrangler.toml` and `worker.ts` exposing A2A Agent Card and MCP
- [x] 2.2 Deploy `yieldrouter-agent` to Cloudflare Workers (`bunx wrangler deploy`)
- [x] 2.3 Probe live endpoints on `https://yieldrouter-agent.<account>.workers.dev` (card, mcp, ping)
- [x] 2.4 Register ERC-8004 identity on BSC Testnet for wallet `0xe1D07be03DDE2C292f842AdE4f34782FDf9176c5`
- [x] 2.5 Record minted `agent_id` token ID (`2301`)

## 3. Gridrunner Deployment & Registration (Grid Trading)

- [x] 3.1 Create `agents/gridrunner/wrangler.toml` and `worker.ts` exposing A2A Agent Card and MCP
- [x] 3.2 Deploy `gridrunner-agent` to Cloudflare Workers (`bunx wrangler deploy`)
- [x] 3.3 Probe live endpoints on `https://gridrunner-agent.<account>.workers.dev` (card, mcp, ping)
- [x] 3.4 Register ERC-8004 identity on BSC Testnet for wallet `0x78f800FBA857Ae0a33eEa55f62a68ddA20b27185`
- [x] 3.5 Record minted `agent_id` token ID (`2302`)

## 4. Ledger & Delivery Synchronization

- [x] 4.1 Update `docs/DECISIONS.md` with topic key `agents/deploy-register-remaining-agents`
- [x] 4.2 Format the complete 4-category delivery facts payload for Catalog (Stream C) and Signal (Stream S)
