/**
 * Pre-PR audit gate.
 *
 *   node scripts/pr-audit.mjs [--body <file>] [--skip-build]
 *
 * Two classes of check, because a PR can fail a reader in two ways.
 *
 * Build checks answer "does this work". Description checks answer "is what
 * the description claims actually true" — a PR body that names a file that
 * does not exist, or cites an issue number that is not real, misleads a
 * reviewer more than a red build does, because nothing turns red.
 *
 * Exit code 0 means safe to open. Any non-zero means stop.
 */

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
const bodyFlag = args.indexOf("--body");
const bodyPath = bodyFlag !== -1 ? args[bodyFlag + 1] : null;
const skipBuild = args.includes("--skip-build");

const repoRoot = resolve(
  execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim(),
);

const failures = [];
const warnings = [];

function pass(label, extra = "") {
  console.log(`PASS  ${label}${extra ? `  ${extra}` : ""}`);
}
function fail(label, detail) {
  console.log(`FAIL  ${label}`);
  failures.push(`${label}${detail ? `\n      ${detail}` : ""}`);
}
function warn(label, detail) {
  console.log(`WARN  ${label}${detail ? `  ${detail}` : ""}`);
  warnings.push(label);
}

function git(...a) {
  return execFileSync("git", a, { cwd: repoRoot, encoding: "utf8" }).trim();
}

function runPnpm(script) {
  const r = spawnSync("pnpm", [script], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  return { ok: r.status === 0, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

// ---------------------------------------------------------------- git state

console.log("--- repository state ---");

let branch = "";
try {
  branch = git("rev-parse", "--abbrev-ref", "HEAD");
} catch {
  fail("in a git repository", "git rev-parse failed");
}

if (branch === "main" || branch === "master") {
  fail("on a topic branch", `HEAD is ${branch}; this repo forbids PRs from the default branch`);
} else if (branch) {
  pass("on a topic branch", branch);
}

const status = git("status", "--porcelain");
if (status) {
  fail(
    "working tree is clean",
    `uncommitted changes would NOT be in the PR:\n      ${status.split("\n").join("\n      ")}`,
  );
} else {
  pass("working tree is clean");
}

// Unpushed commits mean the PR body describes work GitHub cannot see.
try {
  const upstream = git("rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}");
  const ahead = git("rev-list", "--count", `${upstream}..HEAD`);
  if (Number(ahead) > 0) {
    fail("branch is pushed", `${ahead} local commit(s) not on ${upstream}`);
  } else {
    pass("branch is pushed", upstream);
  }
} catch {
  fail("branch is pushed", "no upstream; push the branch before opening a PR");
}

// The repo's own branch-name rule, from docs/sprint.md.
const branchPattern = /^(feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert)\/[a-z0-9._-]+$/;
if (branch && branch !== "main" && !branchPattern.test(branch)) {
  fail("branch name matches the repo convention", `"${branch}" does not match ${branchPattern}`);
} else if (branch && branch !== "main") {
  pass("branch name matches the repo convention");
}

// ------------------------------------------------------------ build checks

console.log("\n--- build ---");

const rootScripts = JSON.parse(
  readFileSync(join(repoRoot, "package.json"), "utf8"),
).scripts ?? {};

for (const script of ["typecheck", "test", "build"]) {
  if (!(script in rootScripts)) {
    // A missing script is a gap, not a failure. Blocking on it would stop
    // work in a repo that simply has no suite yet.
    warn(`no root "${script}" script to run`);
    continue;
  }
  if (script === "build" && skipBuild) {
    warn("pnpm build skipped (--skip-build)");
    continue;
  }
  const { ok, out } = runPnpm(script);
  if (ok) pass(`pnpm ${script}`);
  else fail(`pnpm ${script}`, out.trim().split("\n").slice(-12).join("\n      "));
}

// ------------------------------------------------- description sanity checks

if (bodyPath) {
  console.log("\n--- description ---");

  if (!existsSync(bodyPath)) {
    fail("body file exists", bodyPath);
  } else {
    const body = readFileSync(bodyPath, "utf8");

    if (body.trim().length < 80) {
      fail("body says something", "under 80 characters");
    } else {
      pass("body says something", `${body.length} chars`);
    }

    // Unresolved placeholders. A shipped "TODO" in a description is a
    // sentence the author meant to finish.
    //
    // Code spans and fenced blocks are stripped first: a doc that explains
    // it detects `TODO` is discussing the word, not leaving one behind.
    const prose = body
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`[^`\n]*`/g, " ");
    const placeholders = prose.match(/\b(TODO|TBD|FIXME|XXX|LOREM)\b|<[A-Z_]{3,}>/g);
    if (placeholders) {
      fail("no unresolved placeholders", [...new Set(placeholders)].join(", "));
    } else {
      pass("no unresolved placeholders");
    }

    // Every repo-looking path in backticks must exist. This is the check
    // that catches a confidently named file that was never written.
    const pathish = new Set(
      [...body.matchAll(/`([^`\n]+)`/g)]
        .map((m) => m[1].trim())
        .filter((t) => /^[\w.@/-]+\/[\w.@/-]+\.\w+$/.test(t) && !t.startsWith("http")),
    );
    const missing = [...pathish].filter((p) => !existsSync(join(repoRoot, p)));
    if (missing.length) {
      fail("every file path in the body exists", missing.join(", "));
    } else {
      pass("every file path in the body exists", `${pathish.size} checked`);
    }

    // Referenced issues and PRs must be real.
    const refs = [...new Set([...body.matchAll(/(?:^|\s)#(\d+)\b/g)].map((m) => m[1]))];
    if (refs.length === 0) {
      pass("no issue references to verify");
    } else {
      const bad = [];
      for (const n of refs) {
        const r = spawnSync("gh", ["issue", "view", n, "--json", "number"], {
          cwd: repoRoot,
          encoding: "utf8",
          shell: process.platform === "win32",
        });
        const r2 =
          r.status === 0
            ? r
            : spawnSync("gh", ["pr", "view", n, "--json", "number"], {
                cwd: repoRoot,
                encoding: "utf8",
                shell: process.platform === "win32",
              });
        if (r2.status !== 0) bad.push(`#${n}`);
      }
      if (bad.length) fail("every referenced issue or PR exists", bad.join(", "));
      else pass("every referenced issue or PR exists", refs.map((n) => `#${n}`).join(" "));
    }

    // A body that claims a command passed must not be the only evidence.
    // The build section above already ran them; this only catches a claim
    // about a command this gate does not run.
    const claimed = [...body.matchAll(/`(pnpm [a-z:]+)`/g)].map((m) => m[1]);
    const covered = ["pnpm typecheck", "pnpm test", "pnpm build"];
    const unverified = [...new Set(claimed)].filter((c) => !covered.includes(c));
    if (unverified.length) {
      warn("body cites commands this gate does not run", unverified.join(", "));
    }
  }
} else {
  console.log("\n--- description ---");
  warn("no --body given; description not audited");
}

// ------------------------------------------------------------------ verdict

console.log("");
if (failures.length) {
  console.log(`BLOCKED — ${failures.length} check(s) failed:\n`);
  for (const f of failures) console.log(`  - ${f}`);
  console.log("\nFix these before opening the PR.");
  process.exit(1);
}
console.log(
  warnings.length ? `AUDIT PASSED with ${warnings.length} warning(s).` : "AUDIT PASSED.",
);
process.exit(0);
