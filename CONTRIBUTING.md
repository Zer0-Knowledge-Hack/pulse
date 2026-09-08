# Contributing

This repo is a five-person hackathon build. Path ownership is the concurrency model: one workstream, one directory tree, stacked PRs to `main`. `main` must stay demoable.

**Do not commit on `main`. Do not push to `main`.** Open a topic branch and a pull request. GitHub rejects direct pushes.

English is the language of git, docs, specs, PRs, and code comments.

Checkpoint through Monday 7 Sep: [`docs/sprint.md`](docs/sprint.md).

## Quick path

1. Claim the workstream you own ([`docs/sprint.md`](docs/sprint.md)). Do not split a stream across two people.
2. Update local `main`, then branch: `feat/<short-behavior>` (see naming below).
3. Ship one user-visible behavior per PR. Rebase. Squash-merge on GitHub.
4. If you need a domain-type change, land that PR first, then yours.

```bash
git fetch origin
git checkout main
git pull origin main
git checkout -b feat/short-behavior
git push -u origin HEAD
gh pr create --base main
```

Forbidden: `git push origin main`, force-push of `main`, and any commit made while checked out on `main`. If that already happened locally, `git checkout -b feat/your-work` and push the branch — never the `main` ref.

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
- Agents publish listing facts (tokenId, endpoint, category, chain). Catalog writes `packages/indexer/fixtures/featured.json`.

Platform is the only person allowed to edit another tree, and only to unblock a red `main`.

## Branch and PR rules

Branch names: `^(feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert)/[a-z0-9._-]+$`

| Rule | Why |
|------|-----|
| Topic branch + PR into `main` | `main` stays the demo; GitHub blocks direct pushes |
| One behavior per PR | Revert without taking the demo down |
| Tests and fixtures travel with the behavior | Preview and CI stay honest |
| No PR that edits two workstream trees | Domain change = its own PR, Platform reviews |
| Preview URL on `apps/web` PRs | Click the nightly demo script on the preview |
| `size:exception` allowed for UI polish | Do not block ship on a 400-line budget; still split mixed concerns |

This project uses **stacked PRs to `main`**, not a feature-branch chain between people. After Day-0, slices merge independently. Self-merge is allowed only when CI is green and the diff stays in your tree. Prefer one review.

### PR review order

1. Does this stay inside the author's tree?
2. Does `packages/domain` stay untouched, or is there a preceding domain PR?
3. Can a judge still complete land → category → hire on `main` after merge?

Intentionally out of scope for most PRs: new protocols, custodial vaults, infinite-scroll of 200k agents.

## Decisions

Do not bury architecture in chat. Record it in OpenSpec and mirror it to Engram. Process: [docs/DECISIONS.md](docs/DECISIONS.md).

## Audit before you open a PR

```bash
pnpm pr:audit --body <your-pr-body.md>
```

It runs typecheck, tests and build, and it reads the description you are
about to publish. A PR can mislead a reviewer in two ways, and only one of
them turns CI red.

The description checks are the other half: every file path you name in
backticks must exist, every `#123` you cite must be a real issue or PR, and
a leftover `TODO` blocks. A description that names a file nobody wrote costs
a reviewer more time than a failing build, because nothing flags it.

It also refuses to pass while the working tree is dirty or the branch is
unpushed, since either means the PR will not contain what you are describing.

## Checklist

- [ ] You are not on `main` when you commit
- [ ] Branch name matches the regex above
- [ ] `pnpm pr:audit --body <file>` passes
- [ ] PR description states what to review first and what is out of scope
- [ ] Fixtures or tests cover the new behavior
- [ ] You did not add a second copy of a decision that already lives in `openspec/specs/`

## Next step

Read the locked specs in [`openspec/specs/`](openspec/specs/) before writing code that fights them. Visual identity: [`docs/brand.md`](docs/brand.md) (pulse persist + [BNB Chain guidelines](https://www.bnbchain.org/en/brand-guidelines)). Monday plan: [`docs/sprint.md`](docs/sprint.md).
