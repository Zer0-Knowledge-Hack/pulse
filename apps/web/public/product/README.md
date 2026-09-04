# pulse persist assets

Canonical product mark. Cut: **persist** — CRT phosphor with a short afterglow of the last sweep.

Do not put these files in `public/brand/` — that folder is unmodified BNB Chain SVGs.

| File | Kind | Use |
|------|------|-----|
| `pulse.svg` | Vector lockup | Docs, print-adjacent, anywhere SVG is accepted |
| `pulse-mark.svg` | Vector p-beam | Favicon SVG |
| `pulse-lockup.png` | Raster lockup on `#0B0E11` | Open Graph, decks, README |
| `pulse-icon.png` | 1024² raster | Apple touch, social square |
| `favicon.ico` | 16/32/48/256 | Browser tab |

Rebuild rasters after editing the mark:

```bash
pnpm --filter @era/web brand:export
```

Source: `apps/web/src/components/brand/pulse-persist-mark.tsx` via Remotion stills.
