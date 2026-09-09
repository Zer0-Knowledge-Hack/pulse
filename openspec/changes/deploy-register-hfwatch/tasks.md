## 1. Inspection & Read-Only Check

- [x] 1.1 Verify local `agents/hfwatch` runtime responds to ping and serves agent-card (verified 200 OK)
- [x] 1.2 Run `pnpm register -- --agent hfwatch --check` from `agents/scripts` to confirm registration state on BSC Testnet (confirmed `not registered`)

## 2. Public Deployment & Endpoint Verification

- [x] 2.1 Deploy `agents/hfwatch` to an HTTPS public host (`https://hfwatch-agent.moisescisnerosdl.workers.dev`)
- [x] 2.2 Probe `GET https://<host>/.well-known/agent-card.json` to verify valid A2A agent card (HTTP 200 OK)
- [x] 2.3 Probe `https://<host>/mcp` to verify valid MCP protocol response (HTTP 200 OK)

## 3. BSC Testnet Registration (Chain ID 97)

- [x] 3.1 Run `WALLET_PASSWORD=<pwd> pnpm register -- --agent hfwatch --endpoint https://<host>` with sponsored MegaFuel paymaster (registered as agent_id=2292)
- [x] 3.2 Verify transaction and minting on BscScan Testnet (`https://testnet.bscscan.com`) for wallet `0x6d07BBc31ea6A9d05B323123470Ae2a7955FfCad`

## 4. Handoff to Catalog & Signal

- [x] 4.1 Format listing facts according to `agents/LISTING-HANDOFF.md`
- [x] 4.2 Prepared delivery block for GitHub Issue #18 to notify `@fercodes` (Stream S) and `@XxHugheadxX` (Stream C)
