# Stack Specification

## Purpose

Lock the runtimes and libraries for the five-day build so the squad does not bikeshed frameworks while implementing hire.

## Requirements

### Requirement: Web app runtime

The web app MUST be a Vite + React SPA with TanStack Router and TypeScript. The web app MUST NOT use Next.js App Router, Astro as the primary app compiler, or Preact (including `preact/compat`) on the wallet path.

#### Scenario: Scaffold matches the lock

- GIVEN a fresh clone after Day-0 scaffold
- WHEN a contributor inspects `apps/web`
- THEN the bundler is Vite and the UI runtime is React
- AND there is no Next.js, Astro, or Preact dependency on the hire path

### Requirement: API is a separate app

HTTP APIs MUST live in `apps/api` as Hono handlers using Zod schemas from `packages/domain`. Catalog owns `apps/api`. The web app MUST NOT grow server route handlers that duplicate that API.

#### Scenario: Path ownership

- GIVEN a listing query from the browse UI
- WHEN the client fetches agents
- THEN it calls `apps/api`
- AND Catalog can change ingest without editing Platform shell files

### Requirement: UI kit

The web UI MUST use Tailwind CSS plus a shadcn-style component kit owned by Platform under `apps/web` UI primitives. Colour and logo usage MUST follow [`openspec/specs/brand/spec.md`](../brand/spec.md). Other workstreams MUST reuse those primitives instead of adding a second design system.

#### Scenario: Shared chrome

- GIVEN a Catalog card and a Commerce hire drawer
- WHEN both render buttons and inputs
- THEN they import from the Platform-owned UI kit

### Requirement: Buyer wallet

The buyer wallet MUST use wagmi v2 plus RainbowKit, configured for BSC mainnet and BSC testnet. The team MUST NOT spend the Commerce calendar writing a custom WalletConnect modal unless RainbowKit is proven blocked.

#### Scenario: Judge can connect

- GIVEN a Chromium browser with an injected wallet
- WHEN the user opens the hire drawer
- THEN they can connect and the app is on BSC or BSC testnet
- AND a wrong-network state is visible

### Requirement: Persistence and agents

Agent listings MUST persist in Postgres (Neon) via Drizzle. Seed agents MUST be BNB Agent Studio TypeScript projects (`bag` CLI), with Pieverse as the default LLM and IPFS for deploy-ready deliverables.

#### Scenario: Local browse without RPC

- GIVEN fixture JSON for eight featured agents
- WHEN Catalog starts the API with fixtures
- THEN browse renders with zero chain RPC
- AND Commerce uses a mock adapter until `VITE_CHAIN=bsc-testnet`

### Requirement: Payments stack

Job hire MUST use ERC-8183 escrow in `$U`. x402/b402 MAY be added if P0 hire already works. x402 MUST NOT replace the job rail as the primary activate CTA.

#### Scenario: Activate means a job

- GIVEN a featured agent with an ERC-8183 provider address
- WHEN the user confirms hire
- THEN a job is created and funded on-chain (or via the mock adapter in local dev)
