# Agent instructions

This repository uses OpenSpec as the shareable source of truth for architecture and behavior. Engram stores the same decisions under matching `topic_key` values.

## Quick path

1. Read [`openspec/config.yaml`](openspec/config.yaml) for stack, persistence mode, and phase rules.
2. Read [`openspec/specs/`](openspec/specs/) before changing product, stack, team topology, or commerce rails.
3. Record new decisions with OpenSpec (change folder → archive into main specs). Mirror to Engram using the `topic_key` in [`docs/DECISIONS.md`](docs/DECISIONS.md).
4. Follow [`CONTRIBUTING.md`](CONTRIBUTING.md) for path ownership and PR shape.

## Hard rules

- Specs, docs, commits, and code comments are English.
- Do not introduce Next.js, Preact, or Astro as the app runtime. Stack is Vite + React + Hono.
- Do not mix the buyer wallet (wagmi) with the agent wallet (Altana).
- Do not edit two workstream trees in one PR.
- `packages/domain` changes require Platform review.
- Persistence mode is **hybrid**: git OpenSpec + Engram. If Engram is down, still write OpenSpec.

## Next step

[`docs/README.md`](docs/README.md)
