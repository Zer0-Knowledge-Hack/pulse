# Monday 7 Sep checkpoint

By **Monday 7 Sep evening**, `main` is a public demo the squad can click. Official submit is **9 Sep** — Monday is the freeze-candidates bar, not the intake form.

Nobody works on `main`. Every change is a topic branch and a squash PR.

## Quick path

1. Claim one workstream in the table below (one person, one stream).
2. `git pull origin main`, then `git checkout -b feat/<short-behavior>`.
3. Push the branch. Open a PR into `main`. Wait for CI. Squash-merge.
4. Never run `git push origin main`. GitHub will reject it.

## Git — non-negotiable

`main` is the nightly demo. Direct commits and direct pushes are forbidden.

```bash
git fetch origin
git checkout main
git pull origin main
git checkout -b feat/short-behavior
# …commits on this branch only…
git push -u origin HEAD
gh pr create --base main
```

| Do | Do not |
|----|--------|
| Branch from latest `main` | Commit while checked out on `main` |
| One user-visible behavior per PR | One PR that edits two workstream trees |
| Squash-merge through GitHub | `git push origin main`, force-push `main` |
| Rebase your branch onto `main` if it drifted | Long-lived feature-branch chains between people |

Branch names: `^(feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert)/[a-z0-9._-]+$`

If you already committed on `main` locally: **do not push**. `git checkout -b feat/your-work` then push that branch.

Self-merge is allowed only when CI is green and the diff stays in your tree. Prefer one review. Platform may merge to unblock a red demo.

Full rules: [CONTRIBUTING.md](../CONTRIBUTING.md).

## Claim a stream today

Five people have write access. A stream MUST NOT be split. Handles: `TOMOKI977`, `moises-cisneros`, `fercodes`, `Pericena`, `XxHugheadxX`.

| Stream | GitHub | Monday P0 (user-visible) |
|--------|--------|--------------------------|
| **P** Platform | `TOMOKI977` (proposed) | Public URL of `main`. Wallet connect on BSC testnet. `main` stays demoable. |
| **C** Catalog | _unclaimed_ | Featured listings stay complete for all four categories. Publish A's agents into fixtures. Featured vs network if 8004scan is ready. |
| **H** Commerce | _unclaimed_ | Hire on BSC testnet: create job → fund → show Funded + tx hash. Mock adapter still works when `VITE_CHAIN=local`. |
| **A** Agents | _unclaimed_ | Four Studio agents in `agents/` (one per category). At least one registered on chain id 97. Hand tokenId / endpoint / category to Catalog — do not edit `apps/web`. |
| **S** Signal | _unclaimed_ | Four category widgets with honest numbers. Start `evidence/` for TermiX (even one recorded task). |

Put your handle in this table (small follow-up PR) once claimed. Path ownership is in [`openspec/specs/team/spec.md`](../openspec/specs/team/spec.md).

## Monday bar vs stretch vs kill

**Monday is a success if** a stranger can: open the public URL → pick Health factor → compare two agents on numbers → connect wallet → hire without a dead end. Local mock hire MUST still work for anyone without a faucet.

| Priority | Ship | Owner |
|----------|------|-------|
| P0 | Public deploy of `main` | P |
| P0 | Four equal category pages (no “coming soon”) | C + P |
| P0 | Four featured agents in the catalog | A → C |
| P0 | Testnet hire **or** a written blocker in the Commerce PR plus mock still green | H |
| P0 | Signal widgets on cards/detail | S |
| Stretch | Neon + Drizzle behind the API | C |
| Stretch | 8004scan ingest, junk hidden | C |
| Stretch | Altana session + Revoke | H |
| Stretch | Three more agents live on testnet | A |
| Stretch | TermiX tasks 2–3 + vs-DIY copy | S |
| Kill | Custom protocols, social feed, custodial vault, 200k-agent infinite scroll | everyone |

On-chain hire is the Functionality prize. If H is slipping Saturday night, H and A pair and drop stretch.

## Calendar (4 Sep night → 7 Sep)

Day-0 scaffold is already on `main` (fixtures, mock hire, Vite shell). This calendar starts now.

| When | P | C | H | A | S |
|------|---|---|---|---|---|
| **Fri 4** | Preview/prod host chosen. README shows the URL when it exists. | Confirm fixture API on the public host. | wagmi connect on the hire drawer for `bsc-testnet`. | `bag init` template + health-factor agent in `agents/`. | Keep widgets honest; list which metrics are still fixtures. |
| **Sat 5** | Demo URL stable. Wrong-network state. | Ingest A's first agent. Start 8004scan **or** skip if it threatens browse. | `createJob` + `fund` on testnet against A's agent. | Register health-factor on chain 97. Start the other three locally. | Venus HF and/or Pancake APR reader on featured agents. |
| **Sun 6 — first real hire** | Job timeline chrome. Nightly demo from prod. | Featured vs network if data exists. | Status poll to Funded. Tx hashes in UI. | One hireable live agent. Pancake skill if that agent is yield/rebalance. | Record TermiX task 1 vs DIY in `evidence/`. |
| **Mon 7 — checkpoint** | Copy, empty/error, mobile enough to demo. No new product bets. | Equal-depth four categories. | Altana grant/revoke if fund already works; otherwise keep hire green. | Remaining agents in fixtures; more live if time. | All four widgets. Report outline, not polish. |
| **Tue 8 / Wed 9** | Intake, video, freeze. | No new features. | Mainnet only if testnet hire is already boring. | Endpoints stay up. | Attach report + wallets to submission. |

Nightly demo (same script every evening): land → Health factor → compare two agents on the signal, not the description → connect → hire → see Funded → show session cap / Revoke if it exists → repeat once on another category. If hire fails, that is the next morning's only P0 for H and A.

## Composition (so you do not collide)

| Slot | Who implements | Who renders | Contract |
|------|----------------|-------------|----------|
| `AgentListing` | domain (P gate) + C | everyone | Zod in `packages/domain` |
| `<HireCTA />` | H | C on card + detail | `agentId` only |
| `<CategorySignal />` | S | C on card + detail | `agentId`, `category` |
| Featured records | A publishes facts | C writes `packages/indexer/fixtures/featured.json` | tokenId, endpoint, category, chain |

Do not inline another stream's UI. Need a new domain field? Dedicated PR, Platform reviews, then your feature PR.

## Checklist

- [ ] I know my letter (`P` / `C` / `H` / `A` / `S`)
- [ ] I am on a topic branch, not `main`
- [ ] My PR touches one tree
- [ ] After merge, land → category → hire still works on `main`

## Next step

[Contributing](../CONTRIBUTING.md) · [Product cut line](../openspec/specs/product/spec.md) · [Hackathon brief](https://www.bnbchain.org/en/hackathons/smart-money-era)
