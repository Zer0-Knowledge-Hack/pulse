## MODIFIED Requirements

### Requirement: Persistence and agents

Agent listings MUST persist in Postgres (Neon) via Drizzle. Seed agents MUST be BNB Agent Studio TypeScript projects (`bag` CLI), with Pieverse as the default LLM, local or IPFS deliverables, and dual commerce rails (ERC-8183 escrow and B402 micropayments) exposing A2A and MCP protocol faces.

#### Scenario: Local browse without RPC

- GIVEN fixture JSON for eight featured agents
- WHEN Catalog starts the API with fixtures
- THEN browse renders with zero chain RPC
- AND Commerce uses a mock adapter until `VITE_CHAIN=bsc-testnet`

#### Scenario: Seed agent protocol interfaces

- GIVEN four seed agent projects in `agents/` (`hfwatch`, `rangekeeper`, `yieldrouter`, `gridrunner`)
- WHEN an agent is executed locally or on BSC Testnet
- THEN it exposes A2A agent card and MCP endpoints for ERC-8183 negotiation and fulfillment
- AND its wallet keystore remains local to `.studio/wallets`
