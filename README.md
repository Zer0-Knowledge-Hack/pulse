# pulse

A hireable DeFi-agent marketplace for BNB Smart Chain.

![pulse persist](apps/web/public/product/pulse-lockup.png)

Built for the [BNB Chain Smart Money Era hackathon](https://www.bnbchain.org/en/hackathons/smart-money-era): discover agents by job, compare them with real signals, and hire them on-chain.

This is not an ERC-8004 explorer clone. Identity already exists. The product is conversion: land, find by category, understand, activate.

## Quick path

1. Node 22+ and [pnpm](https://pnpm.io) 10.
2. `pnpm install`
3. `cp apps/web/.env.example apps/web/.env`
4. `pnpm dev` — API on :3001, web on :5173
5. Open [http://localhost:5173](http://localhost:5173), pick Health factor, hire. Local mode uses the mock commerce adapter (no wallet popup).

## Details

| Topic | Decision |
|-------|----------|
| Product | Four equal categories: rebalancing, grid trading, yield, health-factor. Featured live agents carry the demo. |
| Web | Vite + React + TanStack Router + Tailwind |
| API | Hono, fixture catalog for Day 0 (Postgres/Drizzle next) |
| Buyer wallet | wagmi v2 + RainbowKit on BSC and BSC testnet |
| Agent wallet | Altana session keys inside BNB Agent Studio |
| Hire rail | ERC-8183 jobs in `$U`. Local: mock adapter when `VITE_CHAIN=local` |
| Persistence | OpenSpec in git (`openspec/`) + Engram with matching `topic_key`s |
| Brand | pulse persist mark + [BNB Chain guidelines](https://www.bnbchain.org/en/brand-guidelines) — [docs/brand.md](docs/brand.md) |

```
apps/web          Platform shell + feature folders
apps/api          Catalog HTTP API
packages/domain   Shared Zod contract
packages/indexer  Featured fixture catalog
packages/commerce Mock hire adapter
packages/signals  Category metrics
agents/           Studio seed agents (A)
```

## Checklist

- [ ] You know which workstream you own (`P` / `C` / `H` / `A` / `S`) — [sprint.md](docs/sprint.md)
- [ ] You work on a topic branch and open a PR to `main` (never push `main`)
- [ ] You will not edit `packages/domain` without Platform review
- [ ] New decisions go through OpenSpec, then Engram (see [docs/DECISIONS.md](docs/DECISIONS.md))

## Next step

[Monday 7 Sep plan](docs/sprint.md) · [How to contribute](CONTRIBUTING.md) · [Decision log](docs/DECISIONS.md) · [pulse / BNB brand](docs/brand.md) · [License](LICENSE)
