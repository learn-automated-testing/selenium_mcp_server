import { execFileSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { homedir, platform } from 'node:os';
import { classifyDriverError, buildDriverErrorMessage, type ErrorCategory } from './driver-errors.js';

export interface PreflightResult {
  ok: boolean;
  category?: ErrorCategory;
  stderr?: string;
  recommendation?: string;
}

function getSeleniumManagerPath(): string {
  const plat = platform();
  let relative: string;
  switch (plat) {
    case 'darwin':
      relative = 'bin/macos/selenium-manager';
      break;
    case 'win32':
      relative = 'bin/windows/selenium-manager.exe';
      break;
    default:
      relative = 'bin/linux/selenium-manager';
      break;
  }

  // Resolve from the selenium-webdriver package
  try {
    const seleniumDir = join(
      resolve('node_modules', 'selenium-webdriver'),
      relative,
    );
    if (existsSync(seleniumDir)) return seleniumDir;
  } catch { /* fall through */ }

  // Fallback: try relative to cwd
  const fallback = join(process.cwd(), 'node_modules', 'selenium-webdriver', relative);
  return fallback;
}

function getSeleniumCacheDir(): string {
  const plat = platform();
  if (plat === 'win32') {
    return join(process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local'), 'selenium');
  }
  return join(homedir(), '.cache', 'selenium');
}

function clearSeleniumCache(): boolean {
  const cacheDir = getSeleniumCacheDir();
  try {
    if (existsSync(cacheDir)) {
      rmSync(cacheDir, { recursive: true, force: true });
    }
    return true;
  } catch {
    return false;
  }
}

function runSeleniumManager(binaryPath: string, timeoutMs: number): PreflightResult {
  try {
    execFileSync(binaryPath, ['--browser', 'chrome', '--output', 'json'], {
      timeout: timeoutMs,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { ok: true };
  } catch (err: unknown) {
    const stderr = (err as { stderr?: string }).stderr || '';
    const message = err instanceof Error ? err.message : String(err);
    const errorText = stderr || message;

    const category = classifyDriverError(errorText);
    const syntheticErr = new Error(errorText);
    const recommendation = buildDriverErrorMessage(category, syntheticErr);

    return { ok: false, category, stderr: errorText, recommendation };
  }
}

function parseTimeout(): number {
  const DEFAULT_TIMEOUT = 30_000;
  const raw = process.env.SELENIUM_AI_AGENT_PREFLIGHT_TIMEOUT_MS;

  if (!raw) return DEFAULT_TIMEOUT;

  const parsed = parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    console.error(
      `[warn] SELENIUM_AI_AGENT_PREFLIGHT_TIMEOUT_MS="${raw}" is not a valid positive integer; using default ${DEFAULT_TIMEOUT}ms`,
    );
    return DEFAULT_TIMEOUT;
  }

  return parsed;
}

export async function preflightCheck(): Promise<PreflightResult> {
  // FR-5.1: Skip via env var
  if (process.env.SELENIUM_AI_AGENT_SKIP_PREFLIGHT === '1') {
    console.error('[debug] Pre-flight check skipped (SELENIUM_AI_AGENT_SKIP_PREFLIGHT=1)');
    return { ok: true };
  }

  const binaryPath = getSeleniumManagerPath();
  const timeoutMs = parseTimeout();

  if (!existsSync(binaryPath)) {
    return {
      ok: false,
      category: 'UNKNOWN',
      stderr: `Selenium Manager binary not found at: ${binaryPath}`,
      recommendation: 'Ensure selenium-webdriver is installed: npm install selenium-webdriver',
    };
  }

  // First attempt
  let result = runSeleniumManager(binaryPath, timeoutMs);

  if (result.ok) {
    console.error('[debug] Pre-flight check passed');
    return result;
  }

  // Auto-recovery: clear cache and retry once
  console.error('[debug] Pre-flight failed, clearing Selenium cache and retrying...');
  clearSeleniumCache();

  result = runSeleniumManager(binaryPath, timeoutMs);

  if (result.ok) {
    console.error('[debug] Pre-flight passed after cache clear');
    return result;
  }

  console.error(`[error] Pre-flight check failed: ${result.category}`);
  return result;
}
