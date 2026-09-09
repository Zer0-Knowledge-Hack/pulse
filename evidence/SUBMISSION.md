# Pulse — submission package (stream S)

Assemble-in-place template for the hackathon intake form (Tue 8–Wed 9), maintained by stream S.
Fields marked **(owner)** that are still pending stay blank on purpose — we do not invent live
values. Everything else below is real and linkable today (2026-09-09).

## 1. Project identity

| Field | Value | State |
|-------|-------|-------|
| Name | pulse | ready |
| One-liner | Hireable, category-native marketplace front door for DeFi agents on BNB Chain — health-factor, rebalancing, grid and yield agents, compared on live on-chain signals, hired through ERC-8183 escrow | ready |
| Repo | https://github.com/Zer0-Knowledge-Hack/pulse | ready |
| Live URL | https://pulse-94i.pages.dev/ | ready |
| Catalog API | https://pulse-api.juliocesarsevericheorellana.workers.dev/ | ready (redeploy after Catalog #26 so fixtures match chain) |
| Region of app language | English | ready |

## 2. Wallets surfaced by the marketplace

| Role | Address | Note |
|------|---------|------|
| ERC-8183 provider — `hfwatch` | `0x6d07BBc31ea6A9d05B323123470Ae2a7955FfCad` | real vendor wallet (A handoff) |
| ERC-8183 provider — `rangekeeper` | `0xCC2abE29F43EAb530a6b5D93E3C41bc0E7622b47` | real |
| ERC-8183 provider — `yieldrouter` | `0xe1D07be03DDE2C292f842AdE4f34782FDf9176c5` | real |
| ERC-8183 provider — `gridrunner` | `0x78f800FBA857Ae0a33eEa55f62a68ddA20b27185` | real |
| Watch/demo wallet (S signal reader) | `0x22f3e24233B9BDcC65fa855495D99Fe7d2458510` | funded 2026-09-09; Venus testnet position live (HF ≈ 1.84) |

### ERC-8004 token ids (chain 97)

| Catalog id | Token id | Public host |
|------------|----------|-------------|
| `hf-watch` | `2292` | https://hfwatch-agent.moisescisnerosdl.workers.dev |
| `range-keeper` | `2300` | https://rangekeeper-agent.moisescisnerosdl.workers.dev |
| `yield-router` | `2301` | https://yieldrouter-agent.moisescisnerosdl.workers.dev |
| `grid-runner` | `2302` | https://gridrunner-agent.moisescisnerosdl.workers.dev |

Sources: PRs #20/#22 and `agents/LISTING-HANDOFF.md` (docs PR #27). Catalog must still write
these into `featured.json` ([issue #26](https://github.com/Zer0-Knowledge-Hack/pulse/issues/26));
until then the public API may still show Day-0 placeholders.

Payment rails: ERC-8183 escrow in `$U` (canonical BNB Agent Studio deployment, chain id 97,
configurable via `VITE_CONTRACT_ADDRESS` / `VITE_PAYMENT_TOKEN`) with a mock adapter for local
runs; Altana session view (spend cap, expiry, allowlist, revoke) is rendered in the hire panel
but on-chain revoke is not wired yet (stretch).

## 3. Transaction / activity links

### Demo signal position (Venus BSC testnet — ready)

Watch wallet `0x22f3e24233B9BDcC65fa855495D99Fe7d2458510`:

| Step | Tx |
|------|----|
| mint vBNB | https://testnet.bscscan.com/tx/0x3231792f2e5ca8ccebb358352f970d39f4da4b92a9c5e4bbeffb6b6683171651 |
| enterMarkets(vBNB) | https://testnet.bscscan.com/tx/0x2408e1157add407dd9e2125171680f4e79cd1b27a8749a84ced1e47a4f53a433 |
| enterMarkets(vU) | https://testnet.bscscan.com/tx/0xf5ff2acda622d651a79684157622d3a3dae505025c17bcf38095fee5252b9e7b |
| borrow 8 $U | https://testnet.bscscan.com/tx/0x1b20e903bf74d3472256c2fcae4b1b70ae53af1dd96b4a9baebbeb5e0769acc6 |

Signal provenance: live Venus testnet reads for `hf-watch` in
`packages/signals/README.md`. Served by default after PR #24.

### Buyer-side testnet hires — **(owner: H)** pending

Link the job receipts from the live-hire verification
(`packages/commerce/scripts/verify-live.mjs` output / BscScan createJob + fund) here once H
records them. Do not invent hashes.

## 4. Evidence links (TermiX Agent Advantage Report)

| Artifact | Where |
|----------|-------|
| Agent Advantage Report | [`evidence/agent-advantage-report.md`](./agent-advantage-report.md) |
| Task 1 (health-factor) | [`evidence/task-01-health-factor/`](./task-01-health-factor/) — protocol + DIY leg against the live position recorded; **agent leg** still pending a marketplace hire after Catalog #26 |
| Reader provenance (live vs fixture per metric) | [`packages/signals/README.md`](../packages/signals/README.md) |

## 5. Demo video — shot list (recorder: team)

Record without narration scripts if preferred; the nightly demo script doubles as the story:

1. **0:00–0:10** header shows the pulse persist lockup; footer "Building on BNB Chain".
2. **0:10–0:30** land → click **Health factor** category → two featured agents compared on live
   signal numbers (health factor/liquidation price), not paragraphs.
3. **0:30–0:50** open `HF Watch` detail → `<CategorySignal />` metrics + provider address visible.
4. **0:50–1:20** connect RainbowKit on BSC testnet → fund job → status timeline reaches `Funded`
   with tx hash and Altana session (spend cap, expiry, allowlist) → **Revoke** visible if wired.
5. **1:20–1:40** repeat on a second category (yield → compare `net APR` between `yield-router` and
   `apr-hopper`).
6. **1:40–2:00** show the Agent Advantage Report in-repo + honest labeling (`mock`/`testnet`/`live`)
   and where the live signal endpoint reads from (`GET /agents/:id/signal`).

## 6. Submission checklist

- [x] Live URL filled **(P)** — https://pulse-94i.pages.dev/
- [x] Agent ERC-8004 token ids + endpoints filled **(A)** — table in §2; Catalog #26 still needed for marketplace cards
- [ ] Hire receipt tx links filled **(H)**
- [x] Watch wallet funded + live HF served by API **(S)** — card honesty still depends on Catalog #26 + API redeploy
- [ ] Video recorded from the shot list **(any human, 2 min runtime)**
- [ ] Intake form submitted with sections 1–4 above **(S / team)**
