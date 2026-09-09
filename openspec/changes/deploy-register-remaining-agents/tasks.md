## 1. Rangekeeper Deployment & Registration (Rebalancing)

- [ ] 1.1 Create `agents/rangekeeper/wrangler.toml` and `worker.ts` exposing A2A Agent Card and MCP
- [ ] 1.2 Deploy `rangekeeper-agent` to Cloudflare Workers (`bunx wrangler deploy`)
- [ ] 1.3 Probe live endpoints on `https://rangekeeper-agent.<account>.workers.dev` (card, mcp, ping)
- [ ] 1.4 Register ERC-8004 identity on BSC Testnet for wallet `0xCC2abE29F43EAb530a6b5D93E3C41bc0E7622b47`
- [ ] 1.5 Record minted `agent_id` token ID

## 2. Yieldrouter Deployment & Registration (Yield Optimisation)

- [ ] 2.1 Create `agents/yieldrouter/wrangler.toml` and `worker.ts` exposing A2A Agent Card and MCP
- [ ] 2.2 Deploy `yieldrouter-agent` to Cloudflare Workers (`bunx wrangler deploy`)
- [ ] 2.3 Probe live endpoints on `https://yieldrouter-agent.<account>.workers.dev` (card, mcp, ping)
- [ ] 2.4 Register ERC-8004 identity on BSC Testnet for wallet `0xe1D07be03DDE2C292f842AdE4f34782FDf9176c5`
- [ ] 2.5 Record minted `agent_id` token ID

## 3. Gridrunner Deployment & Registration (Grid Trading)

- [ ] 3.1 Create `agents/gridrunner/wrangler.toml` and `worker.ts` exposing A2A Agent Card and MCP
- [ ] 3.2 Deploy `gridrunner-agent` to Cloudflare Workers (`bunx wrangler deploy`)
- [ ] 3.3 Probe live endpoints on `https://gridrunner-agent.<account>.workers.dev` (card, mcp, ping)
- [ ] 3.4 Register ERC-8004 identity on BSC Testnet for wallet `0x78f800FBA857Ae0a33eEa55f62a68ddA20b27185`
- [ ] 3.5 Record minted `agent_id` token ID

## 4. Ledger & Delivery Synchronization

- [ ] 4.1 Update `docs/DECISIONS.md` with topic key `agents/deploy-register-remaining-agents`
- [ ] 4.2 Update `agents/CONTEXT.md` and `.antigravity/CONTEXT.md` with all 4 live endpoints and token IDs
- [ ] 4.3 Format the complete 4-category delivery facts payload for Catalog (Stream C) and Signal (Stream S)
