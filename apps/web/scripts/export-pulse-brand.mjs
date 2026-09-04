import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import pngToIco from "png-to-ico";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "product");
mkdirSync(out, { recursive: true });

function still(id, file, extra = []) {
  const result = spawnSync(
    "pnpm",
    ["exec", "remotion", "still", "remotion/index.ts", id, file, ...extra],
    { cwd: root, stdio: "inherit", shell: true },
  );
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

still("PulseLockup", join(out, "pulse-lockup.png"));
still("PulseIcon", join(out, "pulse-icon.png"));
still("PulseIcon", join(out, "pulse-icon-256.png"), ["--scale=0.25"]);
still("PulseIcon", join(out, "pulse-icon-48.png"), ["--scale=0.046875"]);
still("PulseIcon", join(out, "pulse-icon-32.png"), ["--scale=0.03125"]);
still("PulseIcon", join(out, "pulse-icon-16.png"), ["--scale=0.015625"]);

const ico = await pngToIco([
  join(out, "pulse-icon-16.png"),
  join(out, "pulse-icon-32.png"),
  join(out, "pulse-icon-48.png"),
  join(out, "pulse-icon-256.png"),
]);
writeFileSync(join(out, "favicon.ico"), ico);

console.log("Wrote pulse SVG/PNG/ICO under public/product/");
