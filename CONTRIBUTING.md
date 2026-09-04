# Contributing

This repo is a five-person hackathon build. Path ownership is the concurrency model: one workstream, one directory tree, stacked PRs to `main`. `main` must stay demoable.

English is the language of git, docs, specs, PRs, and code comments.

## Quick path

1. Pick the workstream you own. Do not split a stream across two people.
2. Branch from latest `main`: `feat/<short-behavior>` (see naming below).
3. Ship one user-visible behavior per PR. Rebase, squash-merge.
4. If you need a domain-type change, land that PR first, then yours.

## Workstreams

| Stream | Owns | Does not touch |
|--------|------|----------------|
| **P** Platform | `apps/web` shell, `components/ui`, CI, deploy, gatekeeper of `packages/domain` | Agent runtimes |
| **C** Catalog | `apps/api`, `packages/indexer`, browse routes | Signing / hire txs |
| **H** Commerce | `packages/commerce`, hire routes | Agent `sellerCore` |
| **A** Agents | `agents/*` only | `apps/web` |
| **S** Signal | `packages/signals`, signal widgets, `evidence/` | Indexer ingest |

Composition slots (do not inline the other stream's UI):

- Catalog renders `<HireCTA agentId />` (implemented by Commerce).
- Catalog renders `<CategorySignal agentId category />` (implemented by Signal).
- Agents publish `featured.json`. Catalog ingests it.

Platform is the only person allowed to edit another tree, and only to unblock a red `main`.

## Branch and PR rules

Branch names: `^(feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert)/[a-z0-9._-]+$`

| Rule | Why |
|------|-----|
| One behavior per PR | Revert without taking the demo down |
| Tests and fixtures travel with the behavior | Preview and CI stay honest |
| No PR that edits two workstream trees | Domain change = its own PR, Platform reviews |
| Preview URL on `apps/web` PRs | Click the nightly demo script on the preview |
| `size:exception` allowed for UI polish | Do not block ship on a 400-line budget; still split mixed concerns |

This project uses **stacked PRs to `main`**, not a feature-branch chain. After the Day-0 foundation lands, slices merge independently.

### PR review order

1. Does this stay inside the author's tree?
2. Does `packages/domain` stay untouched, or is there a preceding domain PR?
3. Can a judge still complete land → category → hire on `main` after merge?

Intentionally out of scope for most PRs: new protocols, custodial vaults, infinite-scroll of 200k agents.

## Decisions

Do not bury architecture in chat. Record it in OpenSpec and mirror it to Engram. Process: [docs/DECISIONS.md](docs/DECISIONS.md).

## Checklist

- [ ] Branch name matches the regex above
- [ ] PR description states what to review first and what is out of scope
- [ ] Fixtures or tests cover the new behavior
- [ ] You did not add a second copy of a decision that already lives in `openspec/specs/`

## Next step

Read the locked specs in [`openspec/specs/`](openspec/specs/) before writing code that fights them.
