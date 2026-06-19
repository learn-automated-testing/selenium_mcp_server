import net from 'node:net';
import { existsSync } from 'node:fs';
import {
  detectChromeVersion,
  findCachedDriver,
  getSeleniumCacheDir,
  inspectSeleniumManager,
  type ChromeInfo,
} from './driver-provision.js';
import { loadProxyConfig } from './proxy-config.js';

/** Outcome of inspecting the bundled Selenium Manager binary. */
export interface ManagerInfo {
  readonly path: string | null;
  readonly exists: boolean;
  readonly executable: boolean;
}

/** Result of a single doctor check. */
export interface DoctorCheck {
  readonly name: string;
  readonly ok: boolean;
  readonly detail: string;
  /** Concrete, copy-pasteable next step when the check fails. */
  readonly fix?: string;
}

export interface DoctorReport {
  readonly checks: readonly DoctorCheck[];
  readonly ok: boolean;
}

/** Dependencies of runDoctor, injectable for testing. */
export interface DoctorDeps {
  detectChrome: () => ChromeInfo | null;
  findCached: (major: number) => string | null;
  inspectManager: () => ManagerInfo;
  probe: (host: string, port: number, timeoutMs: number) => Promise<boolean>;
  proxy?: string;
  cacheDir: string;
}

/** Raw TCP reachability probe — dependency-free, honours no proxy itself. */
export function tcpProbe(host: string, port: number, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const finish = (ok: boolean): void => {
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
    socket.connect(port, host);
  });
}

function checkChrome(chrome: ChromeInfo | null): DoctorCheck {
  if (!chrome) {
    return {
      name: 'Chrome installed',
      ok: false,
      detail: 'Google Chrome could not be detected',
      fix: 'Install Google Chrome, or ensure it is on PATH (Linux) / in the standard location.',
    };
  }
  return {
    name: 'Chrome installed',
    ok: true,
    detail: `Chrome ${chrome.version} (major ${chrome.major})`,
  };
}

function checkDriver(chrome: ChromeInfo | null, findCached: (major: number) => string | null): DoctorCheck {
  if (!chrome) {
    return {
      name: 'Matching driver ready',
      ok: false,
      detail: 'skipped — Chrome version unknown',
      fix: 'Resolve the Chrome check first.',
    };
  }
  const driver = findCached(chrome.major);
  if (driver) {
    return {
      name: 'Matching driver ready',
      ok: true,
      detail: `executable chromedriver for Chrome ${chrome.major}: ${driver}`,
    };
  }
  return {
    name: 'Matching driver ready',
    ok: false,
    detail: `no valid cached chromedriver for Chrome ${chrome.major}`,
    fix: 'Start the server once with network access to download it, or run the diagnostic command. '
      + 'If your home/cache is on a shared (VMware/network) folder, point SE_CACHE_PATH at a local disk.',
  };
}

async function checkEndpoint(
  proxy: string | undefined,
  probe: (host: string, port: number, timeoutMs: number) => Promise<boolean>,
): Promise<DoctorCheck> {
  const TIMEOUT = 5_000;

  if (proxy) {
    let host: string;
    let port: number;
    try {
      const url = new URL(proxy);
      host = url.hostname;
      port = url.port ? parseInt(url.port, 10) : url.protocol === 'https:' ? 443 : 80;
    } catch {
      return {
        name: 'Download endpoint reachable',
        ok: false,
        detail: `configured proxy is not a valid URL: ${proxy}`,
        fix: 'Fix the proxy URL in ~/.selenium-ai-agent/config.json or the HTTPS_PROXY env var.',
      };
    }
    const ok = await probe(host, port, TIMEOUT);
    return ok
      ? { name: 'Download endpoint reachable', ok: true, detail: `proxy ${host}:${port} reachable` }
      : {
          name: 'Download endpoint reachable',
          ok: false,
          detail: `proxy ${host}:${port} is NOT reachable`,
          fix: 'Check the proxy host/port and that the VPN is connected.',
        };
  }

  const endpoints: ReadonlyArray<readonly [string, number]> = [
    ['googlechromelabs.github.io', 443],
    ['storage.googleapis.com', 443],
  ];
  const results = await Promise.all(endpoints.map(([h, p]) => probe(h, p, TIMEOUT)));
  const unreachable = endpoints.filter((_, i) => !results[i]).map(([h]) => h);

  if (unreachable.length === 0) {
    return {
      name: 'Download endpoint reachable',
      ok: true,
      detail: 'googlechromelabs.github.io and storage.googleapis.com reachable',
    };
  }
  return {
    name: 'Download endpoint reachable',
    ok: false,
    detail: `unreachable: ${unreachable.join(', ')}`,
    fix: 'Behind a corporate proxy? Set "proxy" in ~/.selenium-ai-agent/config.json or the HTTPS_PROXY env var.',
  };
}

function checkManager(info: ManagerInfo): DoctorCheck {
  if (info.exists && info.executable) {
    return { name: 'Selenium Manager binary', ok: true, detail: `executable: ${info.path}` };
  }
  const detail = !info.path
    ? 'selenium-webdriver could not be resolved'
    : info.exists
      ? `present but not executable: ${info.path}`
      : `not found: ${info.path}`;
  return {
    name: 'Selenium Manager binary',
    ok: false,
    detail,
    fix: 'selenium-webdriver is missing or incompletely installed — reinstall it '
      + '(npm install selenium-webdriver). Under npx, clear the npx cache and retry.',
  };
}

function checkCache(cacheDir: string): DoctorCheck {
  const present = existsSync(cacheDir);
  return {
    name: 'Driver cache location',
    ok: true,
    detail: present ? `${cacheDir} (exists)` : `${cacheDir} (will be created on first run)`,
  };
}

function defaultDeps(): DoctorDeps {
  return {
    detectChrome: detectChromeVersion,
    findCached: (major) => findCachedDriver(major),
    inspectManager: inspectSeleniumManager,
    probe: tcpProbe,
    proxy: loadProxyConfig().proxy,
    cacheDir: getSeleniumCacheDir(),
  };
}

/**
 * Run all preflight diagnostics. Each check carries a concrete fix on failure.
 * Never throws — a failed probe becomes a failed check.
 */
export async function runDoctor(deps: Partial<DoctorDeps> = {}): Promise<DoctorReport> {
  const d: DoctorDeps = { ...defaultDeps(), ...deps };

  const chrome = d.detectChrome();
  const checks: DoctorCheck[] = [
    checkManager(d.inspectManager()),
    checkChrome(chrome),
    checkDriver(chrome, d.findCached),
    await checkEndpoint(d.proxy, d.probe),
    checkCache(d.cacheDir),
  ];

  return { checks, ok: checks.every((c) => c.ok) };
}

/** Render a report as a human-readable, 80-column-friendly block. */
export function formatDoctorReport(report: DoctorReport): string {
  const lines: string[] = ['Selenium AI Agent — doctor', ''];
  for (const check of report.checks) {
    lines.push(`${check.ok ? '[OK]' : '[X] '} ${check.name}`);
    lines.push(`     ${check.detail}`);
    if (!check.ok && check.fix) {
      lines.push(`     fix: ${check.fix}`);
    }
  }
  lines.push('');
  lines.push(report.ok ? 'All checks passed.' : 'Some checks failed — see the fixes above.');
  return lines.join('\n');
}
