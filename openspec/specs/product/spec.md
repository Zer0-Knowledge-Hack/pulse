# Product Specification

## Purpose

Define the marketplace we are building for the BNB Chain Smart Money Era hackathon: a hireable, category-native front door for agents on BSC, not an ERC-8004 explorer.

## Requirements

### Requirement: Marketplace conversion journey

The product MUST let a user with no Agent Studio knowledge complete: land, find an agent by category, understand what it does from data, and activate it. A registry UI that only shows identity counts SHALL be treated as out of scope.

#### Scenario: Judge happy path

- GIVEN a public deployment and a funded testnet wallet
- WHEN the user opens the home page and picks Health Factor
- THEN they can compare at least two agents using domain signals, not descriptions alone
- AND they can start a hire without a dead end

### Requirement: Four first-class categories

The marketplace MUST treat these categories as equal: rebalancing, grid trading, yield optimisation, and health-factor monitoring. A submission that deepens one category and stubs the others SHALL fail the diversity bar.

#### Scenario: Equal-depth navigation

- GIVEN the landing page
- WHEN the user opens each of the four category routes
- THEN each route shows comparable listing depth (featured agents, signals, hire CTA)
- AND none of the four is a placeholder or "coming soon" state at submission

### Requirement: Featured supply vs network index

The product MUST separate featured agents (team-operated, live on BSC, hireable) from indexed network agents. Featured agents MUST carry the demo. Network agents MAY add depth. The UI MUST NOT present an unfiltered dump of the full ERC-8004 registry as the home experience.

#### Scenario: Demo does not depend on junk inventory

- GIVEN 8004scan returns a large mixed set
- WHEN the user lands on a category page
- THEN featured live agents are visible without scrolling the full network list
- AND unclassified or low-confidence network agents are hidden from the primary nav

### Requirement: Live agents on BSC

Agents surfaced for hire MUST be live on BSC (testnet acceptable, mainnet stronger). Mock-only agents MAY exist in local fixtures. They MUST NOT be the only hire targets during judging.

#### Scenario: Eligibility

- GIVEN judging is in progress
- WHEN a judge activates a featured agent
- THEN the agent endpoint is reachable
- AND the agent is registered under ERC-8004 on chain id 56 or 97

### Requirement: Prize targeting with one product

One codebase SHOULD compete for the main track and partner tracks without forked apps. Altana sessions, Pancake utility, and the TermiX Agent Advantage Report MUST be product features or attached evidence, not separate demos.

#### Scenario: Single URL

- GIVEN the public marketplace URL
- WHEN a partner judge looks for their track criteria
- THEN the criterion is visible in-product or linked from the listing
- AND they do not need a second deployment

### Requirement: Cut line

The team MUST ship P0 before P1, and MUST NOT start kill-list work. P0 is a public app, four category pages, featured live agents, one funded ERC-8183 job, and wallet connect. Custom protocols, social feeds, custodial vaults, and infinite-scroll of the full registry MUST NOT be built.

#### Scenario: Scope pressure

- GIVEN calendar time is short
- WHEN a workstream proposes a new protocol or a 200k-agent browser
- THEN the proposal is rejected against this cut line
