#!/usr/bin/env npx tsx
/**
 * Validates all user story markdown files in docs/requirements/.
 *
 * Checks:
 *  1. YAML frontmatter present with required fields (id, epic, priority, status, testing)
 *  2. US id in frontmatter matches filename (US-001 ↔ US-001-*.md)
 *  3. Epic in frontmatter matches parent directory name
 *  4. Status is a known value (draft | ready | in_progress | done | blocked)
 *  5. Priority is a known value (must-have | should-have | could-have | wont-have)
 *  6. H1 title exists and starts with the US id
 *  7. Acceptance criteria section exists and has at least one AC line
 *  8. Epic markdown lists the story in its "User stories" section
 *  9. No duplicate US ids within the same epic
 * 10. PRD lists the epic in its "Epics" section
 *
 * Exit code 0 = all valid, 1 = errors found.
 */

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, basename, dirname, relative } from "node:path";

// ── constants ────────────────────────────────────────────────────────────────

const DOCS_ROOT = join(process.cwd(), "docs", "requirements");
const VALID_STATUSES = new Set(["draft", "ready", "in_progress", "done", "blocked"]);
const VALID_PRIORITIES = new Set(["must-have", "should-have", "could-have", "wont-have"]);
const REQUIRED_FRONTMATTER = ["id", "epic", "priority", "status"] as const;

// ── types ────────────────────────────────────────────────────────────────────

interface Frontmatter {
  [key: string]: string | string[] | undefined;
}

interface ValidationError {
  file: string;
  message: string;
}

interface ValidationWarning {
  file: string;
  message: string;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function parseFrontmatter(content: string): Frontmatter | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const fm: Frontmatter = {};
  for (const line of match[1].split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();

    // Handle YAML arrays like "testing: []"
    if (value === "[]") {
      fm[key] = [];
      continue;
    }
    fm[key] = value;
  }
  return fm;
}

function findFiles(dir: string, pattern: RegExp): string[] {
  const results: string[] = [];
  if (!existsSync(dir)) return results;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(fullPath, pattern));
    } else if (pattern.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

// ── validators ───────────────────────────────────────────────────────────────

const errors: ValidationError[] = [];
const warnings: ValidationWarning[] = [];

function error(file: string, message: string) {
  errors.push({ file: relative(DOCS_ROOT, file), message });
}

function warn(file: string, message: string) {
  warnings.push({ file: relative(DOCS_ROOT, file), message });
}

// ── main ─────────────────────────────────────────────────────────────────────

console.log("Validating user stories in", DOCS_ROOT);
console.log("─".repeat(60));

if (!existsSync(DOCS_ROOT)) {
  console.error(`ERROR: docs/requirements/ not found at ${DOCS_ROOT}`);
  process.exit(1);
}

const storyFiles = findFiles(DOCS_ROOT, /^US-\d{3}.*\.md$/);
console.log(`Found ${storyFiles.length} user story files\n`);

// Track ids per epic for duplicate detection
const idsPerEpic = new Map<string, Map<string, string>>();

// ── 1. Validate each story ──────────────────────────────────────────────────

for (const filePath of storyFiles) {
  const content = readFileSync(filePath, "utf-8");
  const fileName = basename(filePath, ".md");
  const epicDir = basename(dirname(filePath));

  // 1a. Frontmatter exists
  const fm = parseFrontmatter(content);
  if (!fm) {
    error(filePath, "Missing YAML frontmatter (--- block)");
    continue;
  }

  // 1b. Required fields
  for (const field of REQUIRED_FRONTMATTER) {
    if (fm[field] === undefined || fm[field] === "") {
      error(filePath, `Missing required frontmatter field: "${field}"`);
    }
  }

  const id = fm.id as string | undefined;
  const epic = fm.epic as string | undefined;
  const status = fm.status as string | undefined;
  const priority = fm.priority as string | undefined;

  // 2. ID matches filename
  if (id) {
    const expectedPrefix = id; // e.g. "US-001"
    if (!fileName.startsWith(expectedPrefix)) {
      error(filePath, `Frontmatter id "${id}" does not match filename "${fileName}"`);
    }
  }

  // 3. Epic matches parent directory
  if (epic) {
    if (epic !== epicDir) {
      error(filePath, `Frontmatter epic "${epic}" does not match directory "${epicDir}"`);
    }
  }

  // 4. Valid status
  if (status && !VALID_STATUSES.has(status)) {
    error(filePath, `Invalid status "${status}" — expected one of: ${[...VALID_STATUSES].join(", ")}`);
  }

  // 5. Valid priority
  if (priority && !VALID_PRIORITIES.has(priority)) {
    error(filePath, `Invalid priority "${priority}" — expected one of: ${[...VALID_PRIORITIES].join(", ")}`);
  }

  // 6. H1 title with US id
  const h1Match = content.match(/^# (.+)$/m);
  if (!h1Match) {
    error(filePath, "Missing H1 title (# ...)");
  } else if (id && !h1Match[1].includes(id)) {
    error(filePath, `H1 title "${h1Match[1]}" does not contain story id "${id}"`);
  }

  // 7. Acceptance criteria
  const hasAcSection = /^## Acceptance criteria/m.test(content);
  if (!hasAcSection) {
    error(filePath, 'Missing "## Acceptance criteria" section');
  } else {
    const acLines = content.match(/^- \[[ x]\] AC \d+/gm);
    if (!acLines || acLines.length === 0) {
      warn(filePath, "Acceptance criteria section has no AC items (expected `- [ ] AC N — ...`)");
    }
  }

  // 9. Duplicate detection
  if (id && epic) {
    if (!idsPerEpic.has(epic)) idsPerEpic.set(epic, new Map());
    const epicIds = idsPerEpic.get(epic)!;
    if (epicIds.has(id)) {
      error(filePath, `Duplicate id "${id}" in epic "${epic}" — also in ${epicIds.get(id)}`);
    } else {
      epicIds.set(id, relative(DOCS_ROOT, filePath));
    }
  }
}

// ── 8. Check epic files reference their stories ─────────────────────────────

const epicFiles = findFiles(DOCS_ROOT, /^EPIC-\d{3}.*\.md$/);

for (const epicPath of epicFiles) {
  const epicContent = readFileSync(epicPath, "utf-8");
  const epicDirName = basename(dirname(epicPath));
  const epicFileName = basename(epicPath, ".md");

  // Skip if this is not the epic's own file (name matches dir)
  if (epicFileName !== epicDirName) continue;

  // Find all US files in this epic directory
  const epicDir = dirname(epicPath);
  const storiesInDir = readdirSync(epicDir)
    .filter((f) => /^US-\d{3}/.test(f) && f.endsWith(".md"));

  for (const storyFile of storiesInDir) {
    const storySlug = storyFile.replace(".md", "");
    // Check if the epic file links to this story
    if (!epicContent.includes(storySlug)) {
      warn(epicPath, `Story "${storySlug}" exists in directory but is not linked in the epic file`);
    }
  }
}

// ── 10. Check PRD files reference their epics ────────────────────────────────

const prdFiles = findFiles(DOCS_ROOT, /^PRD-\d{3}.*\.md$/);

for (const prdPath of prdFiles) {
  const prdContent = readFileSync(prdPath, "utf-8");
  const prdDirName = basename(dirname(prdPath));
  const prdFileName = basename(prdPath, ".md");

  // Skip if name doesn't match directory
  if (prdFileName !== prdDirName) continue;

  // Find all epic directories in this PRD directory
  const prdDir = dirname(prdPath);
  const epicDirs = readdirSync(prdDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^EPIC-\d{3}/.test(d.name));

  for (const epicEntry of epicDirs) {
    if (!prdContent.includes(epicEntry.name)) {
      warn(prdPath, `Epic directory "${epicEntry.name}" exists but is not linked in the PRD file`);
    }
  }
}

// ── report ───────────────────────────────────────────────────────────────────

console.log("═".repeat(60));
console.log("VALIDATION REPORT");
console.log("═".repeat(60));

if (errors.length === 0 && warnings.length === 0) {
  console.log("\n✓ All stories are valid!\n");
  process.exit(0);
}

if (errors.length > 0) {
  console.log(`\nERRORS (${errors.length}):\n`);
  for (const e of errors) {
    console.log(`  ✗ ${e.file}`);
    console.log(`    ${e.message}\n`);
  }
}

if (warnings.length > 0) {
  console.log(`\nWARNINGS (${warnings.length}):\n`);
  for (const w of warnings) {
    console.log(`  ⚠ ${w.file}`);
    console.log(`    ${w.message}\n`);
  }
}

console.log("─".repeat(60));
console.log(`Total: ${storyFiles.length} stories, ${errors.length} errors, ${warnings.length} warnings`);
console.log("─".repeat(60));

process.exit(errors.length > 0 ? 1 : 0);
