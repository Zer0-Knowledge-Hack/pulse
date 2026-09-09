# Pulse — submission package (stream S)

Assemble-in-place template for the hackathon intake form (Tue 8–Wed 9), maintained by stream S.
Fields marked **(owner)** are owned by another workstream and are intentionally left as pending —
per the handoff rule in `agents/LISTING-HANDOFF.md` we do not invent live values. Everything else
is real and linkable today.

## 1. Project identity

| Field | Value | State |
|-------|-------|-------|
| Name | pulse | ready |
| One-liner | Hireable, category-native marketplace front door for DeFi agents on BNB Chain — health-factor, rebalancing, grid and yield agents, compared on live on-chain signals, hired through ERC-8183 escrow | ready |
| Repo | https://github.com/Zer0-Knowledge-Hack/pulse | ready |
| Live URL | **(owner: P)** _pending public deploy of `main`_ | TODO |
| Region of app language | English | ready |

## 2. Wallets surfaced by the marketplace

| Role | Address | Note |
|------|---------|------|
| ERC-8183 provider — `hfwatch` | `0x6d07BBc31ea6A9d05B323123470Ae2a7955FfCad` | real vendor wallet (A handoff) |
| ERC-8183 provider — `rangekeeper` | `0xCC2abE29F43EAb530a6b5D93E3C41bc0E7622b47` | real |
| ERC-8183 provider — `yieldrouter` | `0xe1D07be03DDE2C292f842AdE4f34782FDf9176c5` | real |
| ERC-8183 provider — `gridrunner` | `0x78f800FBA857Ae0a33eEa55f62a68ddA20b27185` | real |
| Watch/demo wallet (S signal reader demo position) | `0x22f3e24233B9BDcC65fa855495D99Fe7d2458510` | awaiting testnet funds — receiving tBNB from the team for the live health-factor demo |
| ERC-8004 token ids | **(owner: A)** — pending registration; registry ids cannot be filled honestly yet | pending |

Payment rails: ERC-8183 escrow in `$U` (canonical BNB Agent Studio deployment, chain id 97,
configurable via `VITE_CONTRACT_ADDRESS` / `VITE_PAYMENT_TOKEN`) with a mock adapter for local
runs; Altana session view (spend cap, expiry, allowlist, revoke) rendered in the hire panel.

## 3. Transaction / activity links

- Buyer-side testnet hires: **(owner: H)** link the job receipts from the live-hire verification
  (`packages/commerce/scripts/verify-live.mjs` output) — pending H's links.
- Demo signal position txs: pending funding (mint → enterMarkets → borrow; hashes to be appended
  here the hour the wallet is funded).
- Signal provenance: live Venus testnet reads for `hf-watch` documented in
  `packages/signals/README.md`.

## 4. Evidence links (TermiX Agent Advantage Report)

| Artifact | Where |
|----------|-------|
| Agent Advantage Report | [`evidence/agent-advantage-report.md`](./agent-advantage-report.md) |
| Task 1 (health-factor) | [`evidence/task-01-health-factor/`](./task-01-health-factor/) — protocol + dry-run DIY leg recorded; final pairs pending agent deployment (A) |
| Reader provenance (live vs fixture per metric) | [`packages/signals/README.md`](../packages/signals/README.md) |

## 5. Demo video — shot list (recorder: team)

Record without narration scripts if preferred; the nightly demo script doubles as the story:

1. **0:00–0:10** header shows the pulse persist lockup; footer "Building on BNB Chain".
2. **0:10–0:30** land → click **Health factor** category → two featured agents compared on live
   signal numbers (health factor/liquidation price), not paragraphs.
3. **0:30–0:50** open `HF Watch` detail → `<CategorySignal />` metrics + provider address visible.
4. **0:50–1:20** connect RainbowKit on BSC testnet → fund job → status timeline reaches `Funded`
   with tx hash and Altana session (spend cap, expiry, allowlist) → **Revoke** visible.
5. **1:20–1:40** repeat on a second category (yield → compare `net APR` between `yield-router` and
   `apr-hopper`).
6. **1:40–2:00** show the Agent Advantage Report in-repo + honest labeling (`mock`/`testnet`/`live`)
   and where the live signal endpoint reads from (`GET /agents/:id/signal`).

## 6. Submission checklist

- [ ] Live URL filled **(P)**
- [ ] Agent ERC-8004 token ids + endpoints filled **(A)**
- [ ] Hire receipt tx links filled **(H)**
- [ ] Watch wallet funded + live HF visible on the card **(teammate funding → S wires it)**
- [ ] Video recorded from the shot list **(any human, 2 min runtime)**
- [ ] Intake form submitted with sections 1–4 above **(S)**
