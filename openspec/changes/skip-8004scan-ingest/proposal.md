# Skip 8004scan ingest for this cycle

## Status

Decided — skip. Not a behavior change (no code currently calls 8004scan), so no spec delta.
Revisit only after every P0 in `docs/sprint.md` is green.

## What

`docs/sprint.md` lists "8004scan ingest, junk hidden" as a **Stretch** item for Catalog (Sat 5),
with an explicit out: "or skip if it threatens browse." This proposal exercises that out for the
current cycle (through the Mon 7 checkpoint).

## Why

- 8004scan (`8004scan.io`, AltLayer's ERC-8004 explorer) is a real third-party service, but no
  documented public REST API was found during research — integrating it now means reverse-engineering
  an undocumented surface under a hard deadline.
- Per `docs/sprint.md`'s Composition table, showing a "network agents" tier alongside featured ones
  needs a **new domain field** (e.g. an `AgentListing` source discriminator). New domain fields
  require a dedicated PR reviewed by Platform *before* a feature PR — that is cross-tree work, not a
  same-tree Catalog change, and directly conflicts with the "sigamos con lo más fácil primero"
  ("easiest first") priority for a single-owner stream today.
  See `packages/domain/src/index.ts` (current `agentListingSchema` — no source/network fields).
- The four P0 items for Catalog (equal category depth, featured agents populated from A, fixture API
  on the public host) do not depend on 8004scan at all. Spending Sat/Sun budget on an undocumented
  external integration risks the one thing `specs/product/spec.md`'s scenario "Demo does not depend
  on junk inventory" already protects against: a browse experience destabilized by a mixed/junk feed.

## Rollback / revisit trigger

Revisit if, after Task #3 (ingest A's featured agents) and Task #5 (Monday equal-depth check) are
done with time still left before the Tue 8/Wed 9 freeze, AND a teammate confirms 8004scan exposes a
usable read endpoint (REST/GraphQL/subgraph) without an API key we do not have.

## Rollout

No code changes. This file plus the `docs/DECISIONS.md` topic_key entry is the full record.
