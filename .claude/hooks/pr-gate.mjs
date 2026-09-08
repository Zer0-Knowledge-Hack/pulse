/**
 * PreToolUse gate: refuse `gh pr create` / `gh pr edit --body*` until the
 * repository's own audit script passes.
 *
 * Reads the hook payload on stdin, extracts the shell command, and gets out
 * of the way unless that command actually publishes a PR description.
 *
 * Fails OPEN on anything unexpected — a broken gate must not become a
 * broken workflow. It denies only when the audit itself reports failure.
 *
 * Wire it up in .claude/settings.local.json (personal, gitignored):
 *
 *   { "hooks": { "PreToolUse": [{ "matcher": "Bash|PowerShell",
 *     "hooks": [{ "type": "command", "timeout": 600,
 *       "command": "node .claude/hooks/pr-gate.mjs" }] }] } }
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

function allow() {
  process.stdout.write("{}");
  process.exit(0);
}

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    }),
  );
  process.exit(0);
}

let raw = "";
for await (const chunk of process.stdin) raw += chunk;

let payload;
try {
  // Strip a UTF-8 BOM. Without this the parse throws and the gate fails
  // open, which is the one failure mode a gate must not have quietly.
  payload = JSON.parse(raw.replace(/^﻿/, ""));
} catch {
  allow();
}

const command = payload?.tool_input?.command;
if (typeof command !== "string") allow();

// Only guard the two commands that publish a description.
const publishes =
  /\bgh\s+pr\s+create\b/.test(command) ||
  (/\bgh\s+pr\s+edit\b/.test(command) && /--body/.test(command));
if (!publishes) allow();

const cwd = process.cwd();
const audit = join(cwd, "scripts", "pr-audit.mjs");
if (!existsSync(audit)) allow(); // repo has no gate; nothing to enforce

// Pull --body-file out of the command so the description itself is
// audited, not just the build.
const bodyMatch =
  command.match(/--body-file[= ]+"([^"]+)"/) ||
  command.match(/--body-file[= ]+'([^']+)'/) ||
  command.match(/--body-file[= ]+(\S+)/);

const args = [audit];
if (bodyMatch) args.push("--body", bodyMatch[1]);

const run = spawnSync(process.execPath, args, {
  cwd,
  encoding: "utf8",
  timeout: 9 * 60 * 1000,
});

if (run.error || run.status === null) allow(); // could not run it; fail open
if (run.status === 0) allow();

const report = `${run.stdout ?? ""}${run.stderr ?? ""}`.trim();
deny(
  [
    "Pre-PR audit failed. The pull request was NOT created.",
    "",
    report,
    "",
    bodyMatch ? "" : "No --body-file was given, so the description was not audited.",
    "Fix the failures above and retry. Do not route around this by editing the gate.",
  ]
    .filter(Boolean)
    .join("\n"),
);
