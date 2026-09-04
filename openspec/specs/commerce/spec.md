# Commerce Specification

## Purpose

Define how users hire agents, how money moves, and how agent authority stays scoped and revocable.

## Requirements

### Requirement: Two wallets never mixed

The user wallet MUST be the ERC-8183 client (buyer). The agent wallet MUST be the provider, preferably an Altana smart agentic wallet with KeyStore sessions. The marketplace MUST NOT take custody of user keys or user funds.

#### Scenario: Pancake-safe execution

- GIVEN a user hires a Pancake liquidity agent
- WHEN the agent rebalances
- THEN it spends from the agent wallet inside session caps
- AND the marketplace host never holds the user's private key

### Requirement: ERC-8183 job lifecycle

Hire MUST follow create job, register policy, set budget, approve `$U`, fund, then poll status through Open, Funded, Submitted, and terminal states. The UI MUST show job status and transaction hashes. Settlement after submit is a user action (approve, reject, or dispute). The product MUST NOT silently auto-settle a buyer's job.

#### Scenario: Funded job is visible

- GIVEN a connected buyer and a live featured agent
- WHEN the buyer confirms a budget and task
- THEN a job id exists on-chain (or in the mock adapter locally)
- AND the UI reaches Funded without a dead end

### Requirement: Altana sessions

Featured autonomous agents SHOULD run under Altana sessions registered in KeyStore with a call allowlist, spend cap, and expiry. The product MUST let the user see those limits and revoke the session. Live transactions MUST be inspectable in the Altana explorer (testnet acceptable, mainnet stronger).

#### Scenario: Revoke

- GIVEN an active session for a hired agent
- WHEN the user clicks Revoke in the product
- THEN KeyStore no longer treats the key as valid
- AND the next agent submit path fails closed

### Requirement: Mock adapter for parallelism

Local and CI MUST support a mock commerce adapter keyed off fixtures so Catalog and Signal can ship without RPC. The real viem adapter MUST activate when the chain env is `bsc-testnet` or `bsc-mainnet`.

#### Scenario: Dev without faucet

- GIVEN `VITE_CHAIN` is unset or local
- WHEN a developer clicks Hire on a fixture agent
- THEN the mock adapter records a job view
- AND no wallet popup is required for Catalog screenshot tests
