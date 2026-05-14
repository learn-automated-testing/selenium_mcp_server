#!/usr/bin/env node
// skillsrepo: stack-freshness hook
// Fires after Edit/Write on a dependency manifest. Reminds the user to refresh
// installed skills/agents so the "Detected stack" section matches reality.
// Fails open — never blocks tool use.

import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";

const DEP_FILES = new Set([
  "package.json",
  "package-lock.json",
  "pyproject.toml",
  "requirements.txt",
  "go.mod",
  "go.sum",
  "Cargo.toml",
  "Cargo.lock",
]);

let input = "";
process.stdin.on("data", (c) => (input += c));
process.stdin.on("end", () => {
  try {
    const payload = input.trim() ? JSON.parse(input) : {};
    const editedPath = payload?.tool_input?.file_path || "";
    if (!editedPath) return;
    const edited = basename(editedPath);
    if (!DEP_FILES.has(edited)) return;

    const meta = findSkillsrepoMeta(editedPath);
    if (!meta) return;

    console.log(
      `\n💡 skillsrepo: ${edited} changed. The "Detected stack" sections on your installed skills may be stale. Run refine_item with resyncBody=false to refresh them, or install_setup with overwrite=true for a full resync.`,
    );
  } catch {
    // fail open
  }
});

function findSkillsrepoMeta(startPath) {
  let dir = dirname(startPath);
  while (dir && dir !== dirname(dir)) {
    const p = join(dir, ".claude", ".skillsrepo.json");
    if (existsSync(p)) return p;
    dir = dirname(dir);
  }
  return null;
}
