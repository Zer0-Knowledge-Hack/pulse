# Team Specification

## Purpose

Define how five developers ship in parallel without colliding, and how `main` stays demoable.

## Requirements

### Requirement: Five vertical workstreams

The squad MUST assign exactly one owner to each stream: Platform (P), Catalog (C), Commerce (H), Agents (A), Signal (S). A stream MUST NOT be split across two people. Streams are vertical slices, not frontend/backend layers.

#### Scenario: Assignment

- GIVEN five contributors
- WHEN work starts after Day-0
- THEN each person has one stream and one directory tree
- AND nobody is "floating" across trees

### Requirement: Path ownership

Each stream MUST only modify its owned paths, except Platform unblocking a red `main`. Agents MUST NOT modify `apps/web`. Commerce MUST NOT classify indexer data. Catalog MUST NOT sign hire transactions.

#### Scenario: PR boundary

- GIVEN a hire-drawer PR from Commerce
- WHEN Platform reviews the diff
- THEN the diff stays under commerce packages and hire routes
- AND `packages/domain` is unchanged unless a prior domain PR exists

### Requirement: Composition slots

Catalog MUST render hire and signal as slots (`HireCTA`, `CategorySignal`) implemented by Commerce and Signal. Agents MUST publish featured agent records. Other streams MUST NOT inline those implementations inside Catalog.

#### Scenario: Parallel UI

- GIVEN Catalog browse is merged with stub slots
- WHEN Commerce lands a real `HireCTA`
- THEN browse shows the real CTA without a Catalog rewrite

### Requirement: Domain package gate

`packages/domain` MUST be the shared contract (Zod types for listings, signals, hire/job views). Changes to it MUST be a dedicated PR reviewed by Platform. Drive-by domain edits inside feature PRs MUST be rejected.

#### Scenario: Type change

- GIVEN Signal needs a new field on `AgentSignal`
- WHEN they implement the widget
- THEN a small domain PR lands first
- AND the widget PR follows

### Requirement: Git topology

After the Day-0 foundation PR, work MUST land as stacked squash PRs onto `main`. Feature-branch chains MUST NOT be the default. `main` MUST remain the nightly demo target.

#### Scenario: Demo from main

- GIVEN it is evening of a build day
- WHEN Platform runs the demo script
- THEN the URL is the production or preview of `main`
- AND a failed step 5 (hire) becomes the next morning's only P0
