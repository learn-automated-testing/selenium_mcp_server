import { resolveDriver, type ResolveOptions, type DriverResolution } from './driver-provision.js';
import { classifyDriverError, buildDriverErrorMessage, type ErrorCategory } from './driver-errors.js';

export interface PreflightResult {
  ok: boolean;
  category?: ErrorCategory;
  stderr?: string;
  recommendation?: string;
  driverPath?: string;
  fromCache?: boolean;
}

/** Signature of the driver resolver, injectable for testing. */
export type DriverResolver = (opts: ResolveOptions) => Promise<DriverResolution>;

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

/**
 * Validate driver acquisition at server start-up. Delegates to resolveDriver,
 * which handles proxy injection, cached-version reuse, corrupt-cache repair and
 * backoff. Failures are classified into an actionable recommendation rather
 * than surfaced as the opaque "Unable to obtain browser driver".
 */
export async function preflightCheck(resolver: DriverResolver = resolveDriver): Promise<PreflightResult> {
  // FR-5.1: Skip via env var
  if (process.env.SELENIUM_AI_AGENT_SKIP_PREFLIGHT === '1') {
    console.error('[debug] Pre-flight check skipped (SELENIUM_AI_AGENT_SKIP_PREFLIGHT=1)');
    return { ok: true };
  }

  const timeoutMs = parseTimeout();

  try {
    const { driverPath, fromCache } = await resolver({ timeoutMs });
    console.error(
      `[debug] Pre-flight check passed (${fromCache ? 'cached' : 'resolved'} driver: ${driverPath})`,
    );
    return { ok: true, driverPath, fromCache };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    const category = classifyDriverError(error.message);
    const recommendation = buildDriverErrorMessage(category, error);
    console.error(`[error] Pre-flight check failed: ${category}`);
    return { ok: false, category, stderr: error.message, recommendation };
  }
}
