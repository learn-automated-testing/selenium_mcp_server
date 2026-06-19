import { execFileSync } from 'node:child_process';
import { existsSync, statSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir, platform } from 'node:os';
import { createRequire } from 'node:module';
import { loadProxyConfig, buildSubprocessEnv } from './proxy-config.js';

// Resolve dependencies relative to THIS module's real location, so the bundled
// selenium-webdriver is found regardless of cwd (the previous cwd-based lookup
// broke under npx, where selenium-webdriver lives in the npx cache).
const requireFromHere = createRequire(import.meta.url);

/** Installed Chrome browser, as far as it could be detected. */
export interface ChromeInfo {
  /** Full version string, e.g. "149.0.7827.155". */
  readonly version: string;
  /** Major version, e.g. 149. */
  readonly major: number;
}

/** Outcome of resolving a usable chromedriver. */
export interface DriverResolution {
  /** Absolute path to a validated, executable chromedriver. */
  readonly driverPath: string;
  /** True when reused from the cache without invoking Selenium Manager. */
  readonly fromCache: boolean;
}

// ---------------------------------------------------------------------------
// Version parsing helpers (pure — the unit-tested core of the match logic)
// ---------------------------------------------------------------------------

/** Extract the first dotted version (e.g. "149.0.7827.155") from arbitrary text. */
export function extractVersion(text: string): string | null {
  const match = text.match(/(\d+(?:\.\d+){1,3})/);
  return match ? match[1] : null;
}

/** Parse the leading major-version integer from a version string. */
export function parseMajor(version: string): number | null {
  const match = version.match(/^\s*(\d+)/);
  if (!match) return null;
  const major = parseInt(match[1], 10);
  return Number.isNaN(major) ? null : major;
}

/** Compare two dotted version strings numerically. Returns <0, 0 or >0. */
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

// ---------------------------------------------------------------------------
// Cache + binary validation
// ---------------------------------------------------------------------------

/**
 * Selenium's driver cache. Selenium Manager defaults to ~/.cache/selenium on
 * EVERY platform (including Windows — it is NOT %LOCALAPPDATA%), overridable
 * via SE_CACHE_PATH.
 */
export function getSeleniumCacheDir(env: NodeJS.ProcessEnv = process.env): string {
  const override = env.SE_CACHE_PATH?.trim();
  if (override) return override;
  return join(homedir(), '.cache', 'selenium');
}

/** Platform-specific chromedriver executable name. */
function driverExeName(): string {
  return platform() === 'win32' ? 'chromedriver.exe' : 'chromedriver';
}

/**
 * Validate that a path is a real, runnable chromedriver — NOT an unextracted
 * .zip or a zero-byte / non-executable file. This is the guard that prevents
 * spawning a .zip as an executable (the EACCES / "Exec format error" failure).
 */
export function isValidDriverBinary(path: string): boolean {
  if (!path) return false;
  if (path.toLowerCase().endsWith('.zip')) return false;
  if (!existsSync(path)) return false;

  let stat;
  try {
    stat = statSync(path);
  } catch {
    return false;
  }

  if (!stat.isFile() || stat.size === 0) return false;

  if (platform() === 'win32') {
    // On Windows executability is by extension; a real driver is an .exe.
    return path.toLowerCase().endsWith('.exe');
  }

  // On POSIX require at least one executable bit.
  const EXECUTABLE_BITS = 0o111;
  return (stat.mode & EXECUTABLE_BITS) !== 0;
}

/**
 * Find a cached chromedriver whose major version matches the installed Chrome.
 * Cache layout: <cache>/chromedriver/<platform>/<version>/chromedriver[.exe].
 * Returns the highest matching patch version, or null when none is valid.
 */
export function findCachedDriver(
  major: number,
  cacheDir: string = getSeleniumCacheDir(),
): string | null {
  const driverRoot = join(cacheDir, 'chromedriver');
  if (!existsSync(driverRoot)) return null;

  const exe = driverExeName();
  let platformDirs: string[];
  try {
    platformDirs = readdirSync(driverRoot);
  } catch {
    return null;
  }

  const candidates: Array<{ version: string; path: string }> = [];
  for (const platDir of platformDirs) {
    const platPath = join(driverRoot, platDir);
    let versions: string[];
    try {
      versions = readdirSync(platPath);
    } catch {
      continue;
    }
    for (const version of versions) {
      if (parseMajor(version) !== major) continue;
      const candidate = join(platPath, version, exe);
      if (isValidDriverBinary(candidate)) {
        candidates.push({ version, path: candidate });
      }
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => compareVersions(b.version, a.version));
  return candidates[0].path;
}

/**
 * Remove the single cache entry (the <version> directory) that holds the given
 * driver path. Targeted repair — never wipes the whole cache.
 */
export function removeCacheEntry(driverPath: string): void {
  // driverPath = <cache>/chromedriver/<platform>/<version>/chromedriver[.exe]
  const versionDir = dirname(driverPath);
  if (existsSync(versionDir)) {
    rmSync(versionDir, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// Selenium Manager invocation
// ---------------------------------------------------------------------------

/** Relative path to the Selenium Manager binary for a given platform. */
export function seleniumManagerRelativePath(plat: NodeJS.Platform = platform()): string {
  switch (plat) {
    case 'darwin':
      return 'bin/macos/selenium-manager';
    case 'win32':
      return 'bin/windows/selenium-manager.exe';
    default:
      return 'bin/linux/selenium-manager';
  }
}

/**
 * The directory where selenium-webdriver is actually installed, via Node's
 * module resolution from this module. Works under npx, global and local
 * installs alike. Throws if selenium-webdriver cannot be resolved.
 */
export function getSeleniumWebdriverDir(): string {
  return dirname(requireFromHere.resolve('selenium-webdriver/package.json'));
}

/**
 * Build the Selenium Manager path. Both inputs are injectable for testing the
 * cross-platform logic without the other platforms' binaries being present.
 */
export function getSeleniumManagerPath(
  plat: NodeJS.Platform = platform(),
  baseDir: string = getSeleniumWebdriverDir(),
): string {
  return join(baseDir, seleniumManagerRelativePath(plat));
}

/** Non-throwing inspection of the Selenium Manager binary, for diagnostics. */
export function inspectSeleniumManager(): { path: string | null; exists: boolean; executable: boolean } {
  let path: string;
  try {
    path = getSeleniumManagerPath();
  } catch {
    // selenium-webdriver itself could not be resolved.
    return { path: null, exists: false, executable: false };
  }
  const exists = existsSync(path);
  return { path, exists, executable: exists && isExecutableFile(path) };
}

/** True if the path is a non-empty file that the OS can execute. */
function isExecutableFile(path: string): boolean {
  let stat;
  try {
    stat = statSync(path);
  } catch {
    return false;
  }
  if (!stat.isFile() || stat.size === 0) return false;
  if (platform() === 'win32') return path.toLowerCase().endsWith('.exe');
  return (stat.mode & 0o111) !== 0;
}

/**
 * Resolve the Selenium Manager binary and verify it exists and is executable.
 * @throws with the attempted path and a remediation hint otherwise.
 */
export function resolveSeleniumManager(): string {
  let path: string;
  try {
    path = getSeleniumManagerPath();
  } catch (err) {
    throw new Error(
      `Could not locate the selenium-webdriver package: ${(err as Error).message}\n`
      + 'selenium-webdriver appears to be missing — reinstall it (npm install selenium-webdriver).',
    );
  }

  if (!existsSync(path)) {
    throw new Error(
      `Selenium Manager binary not found at: ${path}\n`
      + 'selenium-webdriver is missing or incompletely installed — reinstall it '
      + '(e.g. npm install selenium-webdriver, or clear the npx cache).',
    );
  }

  if (!isExecutableFile(path)) {
    throw new Error(
      `Selenium Manager binary at ${path} is not executable.\n`
      + 'The selenium-webdriver install may be corrupt — reinstall it.',
    );
  }

  return path;
}

interface ManagerOutput {
  readonly result?: { readonly driver_path?: string };
}

/**
 * Run Selenium Manager to resolve (and if needed download) the chromedriver.
 * Returns the reported driver_path. Throws with the captured stderr on failure.
 */
function runManager(env: NodeJS.ProcessEnv, timeoutMs: number): string {
  const binary = resolveSeleniumManager();

  let stdout: string;
  try {
    stdout = execFileSync(binary, ['--browser', 'chrome', '--output', 'json'], {
      env,
      timeout: timeoutMs,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch (err: unknown) {
    const stderr = (err as { stderr?: string }).stderr || '';
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(stderr || message);
  }

  let parsed: ManagerOutput;
  try {
    parsed = JSON.parse(stdout) as ManagerOutput;
  } catch {
    throw new Error(`could not parse Selenium Manager output: ${stdout.slice(0, 200)}`);
  }

  const driverPath = parsed.result?.driver_path;
  if (!driverPath) {
    throw new Error('Selenium Manager returned no driver_path');
  }
  return driverPath;
}

// ---------------------------------------------------------------------------
// Chrome detection
// ---------------------------------------------------------------------------

/** Try a command and return its trimmed stdout, or null if it fails. */
function tryCommand(cmd: string, args: readonly string[]): string | null {
  try {
    return execFileSync(cmd, args as string[], {
      encoding: 'utf-8',
      timeout: 5_000,
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return null;
  }
}

/**
 * Detect the installed Chrome version without touching the network, so the
 * cache shortcut can run before any Selenium Manager invocation. Returns null
 * when Chrome cannot be located — callers then fall back to full resolution.
 */
export function detectChromeVersion(): ChromeInfo | null {
  const plat = platform();
  let raw: string | null = null;

  if (plat === 'win32') {
    // Registry BLBeacon holds the live version; HKCU first, then HKLM (incl. WOW6432).
    const keys = [
      'HKCU\\Software\\Google\\Chrome\\BLBeacon',
      'HKLM\\SOFTWARE\\Google\\Chrome\\BLBeacon',
      'HKLM\\SOFTWARE\\WOW6432Node\\Google\\Chrome\\BLBeacon',
    ];
    for (const key of keys) {
      raw = tryCommand('reg', ['query', key, '/v', 'version']);
      if (raw && extractVersion(raw)) break;
    }
  } else if (plat === 'darwin') {
    // Chrome may live in the system or the per-user Applications folder; both
    // are common (the latter when installed without admin rights).
    const macCandidates = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      join(homedir(), 'Applications/Google Chrome.app/Contents/MacOS/Google Chrome'),
    ];
    for (const bin of macCandidates) {
      raw = tryCommand(bin, ['--version']);
      if (raw && extractVersion(raw)) break;
    }
  } else {
    for (const bin of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
      raw = tryCommand(bin, ['--version']);
      if (raw && extractVersion(raw)) break;
    }
  }

  if (!raw) return null;
  const version = extractVersion(raw);
  if (!version) return null;
  const major = parseMajor(version);
  if (major === null) return null;
  return { version, major };
}

// ---------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------

/** Dependencies of resolveDriver, injectable for testing. */
export interface ResolveDeps {
  detectChrome: () => ChromeInfo | null;
  findCached: (major: number) => string | null;
  runManager: (env: NodeJS.ProcessEnv) => string;
  validate: (path: string) => boolean;
  removeEntry: (path: string) => void;
  sleep: (ms: number) => Promise<void>;
}

export interface ResolveOptions {
  readonly maxRetries?: number;
  readonly baseDelayMs?: number;
  readonly timeoutMs?: number;
  readonly env?: NodeJS.ProcessEnv;
}

function defaultDeps(timeoutMs: number): ResolveDeps {
  return {
    detectChrome: detectChromeVersion,
    findCached: (major) => findCachedDriver(major),
    runManager: (env) => runManager(env, timeoutMs),
    validate: isValidDriverBinary,
    removeEntry: removeCacheEntry,
    sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
  };
}

/**
 * Resolve a usable chromedriver, preferring a cached match for the installed
 * Chrome version and only invoking Selenium Manager when needed. Corrupt cache
 * entries are repaired in place; transient download failures are retried with
 * exponential backoff.
 *
 * @throws when no valid driver could be produced after all retries.
 */
export async function resolveDriver(
  options: ResolveOptions = {},
  deps: Partial<ResolveDeps> = {},
): Promise<DriverResolution> {
  const timeoutMs = options.timeoutMs ?? 60_000;
  const d: ResolveDeps = { ...defaultDeps(timeoutMs), ...deps };
  const maxRetries = options.maxRetries ?? 3;
  const baseDelay = options.baseDelayMs ?? 500;
  const env = options.env ?? buildSubprocessEnv(process.env, loadProxyConfig());

  // 1. Reuse a cached driver that matches the installed Chrome major version.
  const chrome = d.detectChrome();
  if (chrome) {
    const cached = d.findCached(chrome.major);
    if (cached) {
      return { driverPath: cached, fromCache: true };
    }
  }

  // 2. Resolve via Selenium Manager, with backoff + targeted corrupt-cache repair.
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      await d.sleep(baseDelay * 2 ** (attempt - 1));
    }

    let driverPath: string;
    try {
      driverPath = d.runManager(env);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      continue;
    }

    if (d.validate(driverPath)) {
      return { driverPath, fromCache: false };
    }

    // Corrupt entry (unextracted .zip / non-executable): remove it and retry.
    lastError = new Error(`resolved driver is not a valid executable: ${driverPath}`);
    try {
      d.removeEntry(driverPath);
    } catch {
      /* best effort */
    }
  }

  throw new Error(
    `driver resolution failed after ${maxRetries} attempt(s): ${lastError?.message ?? 'unknown error'}`,
  );
}
