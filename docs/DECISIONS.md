# Decisions

Every confirmed architecture or product decision is written once in OpenSpec (git, shareable) and mirrored to Engram (session memory) with the same `topic_key`. Chat is not the log.

## Quick path

1. If the decision changes current behavior, open an OpenSpec change under `openspec/changes/<verb-led-id>/`.
2. Write `proposal.md`, spec deltas, and `design.md` when the how is non-obvious.
3. After it is accepted, archive so main specs in `openspec/specs/` become the truth.
4. Save Engram with the `topic_key` from the table below (upsert, do not duplicate). If Engram is down, still land the OpenSpec files.

Bootstrap decisions from 2026-09-04 were recorded directly into main specs. Later changes MUST go through a change folder.

## Topic keys

| Decision | OpenSpec spec | Engram `topic_key` | Type |
|----------|---------------|--------------------|------|
| Product thesis and cut line | [`specs/product/spec.md`](../openspec/specs/product/spec.md) | `architecture/product-thesis` | architecture |
| Web / API / wallet stack | [`specs/stack/spec.md`](../openspec/specs/stack/spec.md) | `architecture/stack` | architecture |
| Five workstreams | [`specs/team/spec.md`](../openspec/specs/team/spec.md) | `architecture/workstreams` | architecture |
| Hire rail and wallets | [`specs/commerce/spec.md`](../openspec/specs/commerce/spec.md) | `architecture/commerce-rails` | architecture |
| BNB Chain brand | [`specs/brand/spec.md`](../openspec/specs/brand/spec.md) | `architecture/brand` | architecture |
| OpenSpec + Engram hybrid | [`specs/documentation/spec.md`](../openspec/specs/documentation/spec.md) | `architecture/sdd-persistence` | architecture |
| SDD init context | [`openspec/config.yaml`](../openspec/config.yaml) | `sdd-init/hackathonera-bnbchain` | architecture |
| Testing capabilities | [`openspec/config.yaml`](../openspec/config.yaml) `testing:` | `sdd/hackathonera-bnbchain/testing-capabilities` | config |
| Skip 8004scan ingest (Stretch, C) | [`changes/skip-8004scan-ingest/proposal.md`](../openspec/changes/skip-8004scan-ingest/proposal.md) | `catalog/skip-8004scan-ingest` | product |
| Seed studio agents (P0, A) | [`changes/scaffold-seed-agents/proposal.md`](../openspec/changes/scaffold-seed-agents/proposal.md) | `agents/seed-studio-agents` | architecture |
| Venus HF signal reader (S) | [`changes/add-venus-hf-reader/proposal.md`](../openspec/changes/add-venus-hf-reader/proposal.md) | `signals/venus-hf-reader` | architecture |
| Reader targets Venus BSC testnet + team-created vBNB position (S) | [`changes/use-venus-testnet-position/proposal.md`](../openspec/changes/use-venus-testnet-position/proposal.md) | `signals/venus-testnet-position` | architecture |
| Deploy and register hfwatch (P0, A) | [`changes/deploy-register-hfwatch/proposal.md`](../openspec/changes/deploy-register-hfwatch/proposal.md) | `agents/deploy-register-hfwatch` | architecture |
| Deploy remaining seed agents (Stretch, A) | [`changes/deploy-register-remaining-agents/proposal.md`](../openspec/changes/deploy-register-remaining-agents/proposal.md) | `agents/deploy-register-remaining-agents` | architecture |

Engram `content` shape (keep it parallel to the spec):

```text
What: one sentence decision
Why: constraint or goal
Where: OpenSpec path
Learned: gotchas (omit if none)
```

## Details

Persistence mode is **hybrid**:

| Store | What it is for |
|-------|----------------|
| `openspec/` | Source of truth the whole squad can review in PRs |
| Engram | Same facts for agents across sessions |
| `docs/` | Human index and this process. Not a third spec tree |

Do not put a second `openspec/` under `docs/`. SDD skills expect `openspec/` at the repo root.

### New decision checklist

- [ ] Change id is kebab-case and verb-led (`lock-stack`, `add-altana-revoke`)
- [ ] Specs use RFC 2119 (`MUST` / `SHALL` / `SHOULD` / `MAY`) and Given/When/Then scenarios
- [ ] Engram `topic_key` is listed here or added in the same PR
- [ ] README / CONTRIBUTING only link the spec; they do not restate the full requirement set

## Next step

Start from [`openspec/config.yaml`](../openspec/config.yaml). For a behavior change, add `openspec/changes/<id>/` rather than editing main specs by hand unless you are archiving.
