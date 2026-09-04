# Smart Money Era Marketplace

A hireable DeFi-agent marketplace for BNB Smart Chain. Built for the [BNB Chain Smart Money Era hackathon](https://www.bnbchain.org/en/hackathons/smart-money-era): discover agents by job, compare them with real signals, and hire them on-chain.

This is not an ERC-8004 explorer clone. Identity already exists. The product is conversion: land, find by category, understand, activate.

## Quick path

1. Read [docs/README.md](docs/README.md) for how this repo is documented.
2. Read [openspec/specs/product/spec.md](openspec/specs/product/spec.md) for what we are building.
3. Read [CONTRIBUTING.md](CONTRIBUTING.md) before you open a branch.
4. Application scaffold lands in a follow-up change. Until then there is nothing to run.

## Details

| Topic | Decision |
|-------|----------|
| Product | Four equal categories: rebalancing, grid trading, yield, health-factor. Featured live agents carry the demo. |
| Web | Vite + React + TanStack Router + Tailwind / shadcn |
| API | Hono + Drizzle + Neon, owned by Catalog |
| Buyer wallet | wagmi v2 + RainbowKit on BSC and BSC testnet |
| Agent wallet | Altana session keys inside BNB Agent Studio |
| Hire rail | ERC-8183 jobs in `$U`. x402 only if time remains |
| Persistence | OpenSpec in git (`openspec/`) + Engram with matching `topic_key`s |

## Checklist

- [ ] You know which workstream you own (`P` / `C` / `H` / `A` / `S`)
- [ ] You will not edit `packages/domain` without Platform review
- [ ] New decisions go through OpenSpec, then Engram (see [docs/DECISIONS.md](docs/DECISIONS.md))

## Next step

[How to contribute](CONTRIBUTING.md) · [Decision log](docs/DECISIONS.md) · [License](LICENSE)
