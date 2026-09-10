# pitch

Honest English pitch deck for the BNB Chain Smart Money Era submission.

## Files

| File | Purpose |
|------|---------|
| [`pulse-pitch.pptx`](./pulse-pitch.pptx) | 8-slide deck aligned to what `main` ships today |
| [`build-deck.mjs`](./build-deck.mjs) | Regenerates the `.pptx` |

## Claims this deck makes

- Public demo + catalog API URLs
- Four equal categories with real seed agent names
- ERC-8004 registrations / Worker endpoints for the four seed agents
- Hire **UI** on BSC testnet (chain 97) via ERC-8183
- Venus health-factor reader with fixture fallback
- Explicitly **does not** claim a public Funded hire receipt (blocked on `$U` faucet at submit time)

## Regenerate

From the repo root (Node 22+, `pptxgenjs` is a root devDependency):

```bash
pnpm install
node pitch/build-deck.mjs
```

## Brand

Dark field `#0B0E11`, accent `#F0B90B`, paper `#FFFFFF`. Wording: “Building on BNB Chain” — never Official / Partnering.
