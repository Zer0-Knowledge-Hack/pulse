# Docs

Human index for this repo. Architecture and behavior live in OpenSpec. This folder tells you where to look and how to add a decision without forking a second source of truth.

## Quick path

1. Locked behavior: [`openspec/specs/`](../openspec/specs/)
2. How to record a decision: [DECISIONS.md](DECISIONS.md)
3. How to send a PR: [`CONTRIBUTING.md`](../CONTRIBUTING.md)
4. Hackathon brief: [BNB Chain Smart Money Era](https://www.bnbchain.org/en/hackathons/smart-money-era)

## Details

| Doc | Role |
|-----|------|
| [DECISIONS.md](DECISIONS.md) | Process: OpenSpec ↔ Engram, topic keys, checklist |
| [`openspec/config.yaml`](../openspec/config.yaml) | SDD mode, stack context, phase rules |
| [`openspec/specs/product/spec.md`](../openspec/specs/product/spec.md) | What we ship and how we win |
| [`openspec/specs/stack/spec.md`](../openspec/specs/stack/spec.md) | Runtime and libraries |
| [`openspec/specs/team/spec.md`](../openspec/specs/team/spec.md) | Five workstreams and path ownership |
| [`openspec/specs/commerce/spec.md`](../openspec/specs/commerce/spec.md) | Hire rail, wallets, payments |
| [`openspec/specs/documentation/spec.md`](../openspec/specs/documentation/spec.md) | How docs and memory stay aligned |

Do not copy specs into `docs/` as a second full tree. Link them. If a spec changes, this index stays valid.

## Checklist

- [ ] You opened a spec, not a chat transcript, before changing architecture
- [ ] You are not about to write an ADR that duplicates `openspec/specs/`

## Next step

[Record or update a decision](DECISIONS.md)
