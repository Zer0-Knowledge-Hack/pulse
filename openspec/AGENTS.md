# OpenSpec

Shareable specs for this repo. Follow `openspec/config.yaml`. Persistence is hybrid with Engram; topic keys live in `docs/DECISIONS.md`.

## Layout

```
openspec/
├── config.yaml
├── specs/{domain}/spec.md      # current truth
└── changes/
    ├── {change-name}/          # proposed change
    └── archive/                # completed changes, never rewrite
```

## Rules

- Do not create a second OpenSpec tree under `docs/`.
- New capabilities become full specs under `specs/` after archive.
- Deltas use `## ADDED|MODIFIED|REMOVED Requirements`.
- If Engram is unavailable, still write these files.
