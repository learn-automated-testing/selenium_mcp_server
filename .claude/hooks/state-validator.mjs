#!/usr/bin/env node
// skillsrepo: state validator hook
// Fires on Stop. Warns about inconsistent workflow state in .claude/state.json.
// Fails open — never blocks.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const statePath = join(cwd, ".claude", "state.json");
if (!existsSync(statePath)) process.exit(0);

try {
  const state = JSON.parse(readFileSync(statePath, "utf8"));
  const warnings = [];

  if (state.status === "blocked") {
    warnings.push(`workflow is blocked — reason: ${state.blocked_reason || "(none recorded)"}`);
  }
  if (state.status === "needs-fixes") {
    warnings.push(`workflow status is 'needs-fixes' — last_output: ${state.last_output || "(none)"}`);
  }
  if (state.current_step && !state.started_at) {
    warnings.push(`current_step=${state.current_step} but started_at is null — state may be inconsistent`);
  }
  if (state.status === "in-progress" && !state.current_step) {
    warnings.push(`status is 'in-progress' but current_step is not set`);
  }

  if (warnings.length > 0) {
    console.log("\n⚠ skillsrepo state check:");
    for (const w of warnings) console.log(`  - ${w}`);
  }
} catch {
  // fail open
}
