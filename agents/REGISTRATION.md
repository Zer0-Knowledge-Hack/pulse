# ERC-8004 registration on BSC Testnet (chain id 97)

Workstream **A** runbook for turning the four seed agents into on-chain
identities that Catalog can list. Completes task 4.3 of
[`scaffold-seed-agents`](../openspec/changes/scaffold-seed-agents/tasks.md).

## Who can run this

Only the holder of the agents' keystores. `bag wallet new` wrote them to
`agents/<agent>/.studio/wallets`, and `.studio/` is gitignored, so the keys
exist on one machine and are not in the repository. A fresh clone cannot
register anything, including the read-only `--check` mode, because the
runtime unlocks the key before it opens an RPC connection.

The wallets already exist and are recorded in each `studio.toml`:

| Agent | Category | Wallet address |
|-------|----------|----------------|
| `hfwatch` | `health_factor` | `0x6d07BBc31ea6A9d05B323123470Ae2a7955FfCad` |
| `rangekeeper` | `rebalancing` | `0xCC2abE29F43EAb530a6b5D93E3C41bc0E7622b47` |
| `yieldrouter` | `yield` | `0xe1D07be03DDE2C292f842AdE4f34782FDf9176c5` |
| `gridrunner` | `grid_trading` | `0x78f800FBA857Ae0a33eEa55f62a68ddA20b27185` |

One wallet owns at most one ERC-8004 identity. A second `register` call on the
same wallet raises `AlreadyRegisteredError` instead of minting a duplicate,
which is why the four agents were given four separate wallets.

## Before you start

**Gas is sponsored.** On `bsc-testnet` the SDK preset routes writes through the
MegaFuel paymaster, so no faucet BNB is needed. Pass `--no-paymaster` only to
self-pay when a relay accepts a transaction but never broadcasts it.

**Pick the endpoint first, not after.** `register` records
`services[].endpoint` on-chain. The endpoint is the base URL of the running
agent; the helper appends the protocol path for you. For `A2A` it appends
`/.well-known/agent-card.json`, and for `MCP` it appends `/mcp`. Registering a
placeholder and fixing it later costs a second transaction, and until that
transaction lands the listing points at nothing.

If the agent is not deployed yet, stop here and deploy it. The registration is
worth nothing to the demo while the endpoint 404s.

## Register

From `agents/scripts`:

```bash
pnpm install
WALLET_PASSWORD=… pnpm register -- --agent hfwatch --check
WALLET_PASSWORD=… pnpm register -- --agent hfwatch --endpoint https://<deployed-host>
```

Always run `--check` first. It reports the current registration and writes
nothing on-chain.

Repeat for `rangekeeper`, `yieldrouter`, and `gridrunner`, each with its own
deployed host. The script prints the listing facts as JSON when it finishes.

The `bag` CLI is the equivalent supported path if you prefer it. Confirm the
flags with `bag erc8004 register --help` before using it, since this runbook
was written against the runtime helpers rather than the CLI surface.

## What the script does

It loads `studio.toml` for the agent, builds the wallet provider from the
`[wallet]` section, then calls `show()` to detect an existing registration
before it ever calls `register()`. That ordering is deliberate: it makes a
re-run safe.

## When it goes wrong

**`AlreadyRegisteredError`** means the wallet already owns an identity. This is
not a failure. The script reports the existing `agent_id` and moves on. To
point that identity at a new host use `bag erc8004 update-endpoint --endpoint
<url>`, never a second register.

**`ERC8004PartialRegistrationError`** means the token was minted but the URI
did not finish writing. The `agent_id` is real and usable, but the on-chain
record is incomplete. Run `update-endpoint` to finish it before handing the id
to Catalog.

**`ERC8004TransactionPendingError`** means the transaction was broadcast and
not confirmed before the timeout. Do not retry blindly. Check the hash on
BscScan testnet first, because a retry after a confirmation mints a second
identity that the first wallet cannot own.

## After registration

Record the `agent_id` as `erc8004TokenId` and hand it to Catalog through
[`LISTING-HANDOFF.md`](./LISTING-HANDOFF.md). Workstream A does not edit
`packages/indexer/fixtures/featured.json`; that file belongs to Catalog.

## Next step

[Listing handoff](./LISTING-HANDOFF.md) · [Agent roster](./README.md) · [Sprint plan](../docs/sprint.md)
