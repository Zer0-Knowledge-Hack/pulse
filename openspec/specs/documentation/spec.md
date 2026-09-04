# Documentation Specification

## Purpose

Keep architecture decisions aligned between git (OpenSpec), agent memory (Engram), and human docs.

## Requirements

### Requirement: Hybrid persistence

The project MUST persist SDD and architecture in OpenSpec at the repository root (`openspec/`) and MUST mirror confirmed decisions to Engram using the `topic_key` table in `docs/DECISIONS.md`. Persistence mode is hybrid. If Engram is unavailable, contributors MUST still write OpenSpec files.

#### Scenario: Engram outage

- GIVEN the Engram MCP server is in error or unauthenticated
- WHEN a decision is confirmed
- THEN `openspec/specs/` or a change folder is updated in git
- AND `docs/DECISIONS.md` still lists the topic key for a later upsert

### Requirement: Single spec tree

Human docs under `docs/` MUST index OpenSpec. They MUST NOT contain a second full copy of requirements. `docs/` MUST NOT host a nested `openspec/` directory.

#### Scenario: Contributor looks for the stack lock

- GIVEN a new teammate opens `docs/README.md`
- WHEN they follow the stack link
- THEN they land on `openspec/specs/stack/spec.md`
- AND they do not find a competing stack ADR with different contents

### Requirement: Language

OpenSpec artifacts, README, CONTRIBUTING, LICENSE notices, PR bodies, and code comments MUST be English. Conversational chat MAY be Spanish.

#### Scenario: PR from any workstream

- GIVEN a Catalog PR
- WHEN a reviewer reads the description and spec links
- THEN the text is English
- AND linked specs use RFC 2119 English

### Requirement: Topic key stability

Each main spec domain MUST have a stable Engram `topic_key`. Updates MUST upsert that key rather than creating a parallel observation for the same decision.

#### Scenario: Stack evolves

- GIVEN `architecture/stack` already exists
- WHEN the squad pins a library version
- THEN Engram is updated in place
- AND a new unrelated topic_key is not invented for the same lock
