# Brand Specification

## Purpose

Apply [BNB Chain brand guidelines](https://www.bnbchain.org/en/brand-guidelines) so the marketplace looks like a project **building on** BNB Chain without implying endorsement.

## Requirements

### Requirement: Official colour tokens

The product UI MUST use the published BNB Chain colours as the primary surface and accent: yellow `#F0B90B` (Pantone 116C), black `#0B0E11`, white `#FFFFFF`. Derived neutrals (borders, muted text, elevated panels) MAY exist but MUST stay on that black/white axis. The UI MUST NOT introduce a competing gold or off-black as the primary accent.

#### Scenario: Primary button

- GIVEN the Platform UI kit
- WHEN a primary button renders
- THEN its fill is `#F0B90B` and its label is `#0B0E11`

### Requirement: Allowed affiliation wording

Copy that mentions BNB Chain MUST use “Building on”, “Available on”, or “Powered by” BNB Chain. The product MUST NOT use “Official”, “Partnering”, or “Collaborating” with BNB Chain unless BNB Chain management has cleared that wording.

#### Scenario: Footer affiliation

- GIVEN the public marketplace shell
- WHEN a visitor reads the footer
- THEN they see “Building on BNB Chain”
- AND they do not see “Official BNB” or “Partner of BNB Chain”

### Requirement: Logo assets and lockups

Logo files MUST be the unmodified official SVGs from the brand kit, stored under `apps/web/public/brand/`. The yellow variants MUST be used on `#0B0E11`. The horizontal lockup MUST be left-aligned and at least 97px wide. The logomark-only asset MUST be at least 15px and MAY be used only as favicon, button icon, or similar allowed cases. Contributors MUST NOT outline, shadow, recolour, stretch, or place the logo on a busy or low-contrast background.

#### Scenario: Footer lockup

- GIVEN the app footer
- WHEN the BNB Chain horizontal yellow lockup renders
- THEN the image is the official SVG, width is at least 97px, and it sits on `#0B0E11`

#### Scenario: Home kicker

- GIVEN the public landing page
- WHEN a visitor reads the hero
- THEN they see “Building on” next to the yellow horizontal lockup (at least 97px, left-aligned)
- AND the header shows the pulse persist mark, not a BNB Chain lockup

### Requirement: pulse persist mark

The product name is lowercase “pulse”. The locked wordmark MUST be the persist cut: phosphor `#F0B90B` on `#0B0E11`, with a dim offset afterglow of the sweep. Canonical files MUST live under `apps/web/public/product/` as SVG lockup, SVG mark, PNG lockup, PNG icon, and ICO. Rasters MUST be generated from the React mark via Remotion (`pnpm --filter @era/web brand:export`). The header and favicon MUST use these files. Contributors MUST NOT use the BNB Chain logomark as the product identity.

#### Scenario: Header identity

- GIVEN the public marketplace shell
- WHEN a visitor looks at the header
- THEN they see the pulse persist lockup
- AND they do not see the BNB Chain lockup in that header slot

### Requirement: Source of truth

Human docs MUST point at the official guidelines URL plus `openspec/specs/brand/spec.md`. They MUST NOT invent a second colour system. Logo use in this hackathon build is “Building on BNB Chain” identification only; it MUST NOT be presented as BNB Chain endorsement.

#### Scenario: Contributor checks tokens

- GIVEN a designer or Platform engineer
- WHEN they open `docs/brand.md`
- THEN they find hex values `#F0B90B`, `#0B0E11`, `#FFFFFF` and a link to https://www.bnbchain.org/en/brand-guidelines
