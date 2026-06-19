import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

/**
 * Proxy settings resolved for the driver-download subprocess.
 *
 * Both fields are optional: an absent field means "no explicit setting,
 * let the subprocess fall back to its own defaults".
 */
export interface ProxyConfig {
  /** Proxy URL applied to both HTTP and HTTPS traffic (e.g. http://proxy.corp:8080). */
  readonly proxy?: string;
  /** Comma-separated list of hosts that bypass the proxy. */
  readonly noProxy?: string;
}

/** Shape of the on-disk config file before validation. */
interface RawConfig {
  readonly proxy?: unknown;
  readonly noProxy?: unknown;
}

/**
 * Resolve the config-file path: the SELENIUM_AI_AGENT_CONFIG override if set,
 * otherwise ~/.selenium-ai-agent/config.json.
 *
 * A file in the home directory (not the project) is the only reliable source
 * for a GUI-launched MCP server, which does not inherit the user's shell env.
 */
export function getConfigPath(env: NodeJS.ProcessEnv = process.env): string {
  const override = env.SELENIUM_AI_AGENT_CONFIG?.trim();
  if (override) return override;
  return join(homedir(), '.selenium-ai-agent', 'config.json');
}

/** Return the first non-empty env var among the given names (case variants). */
function envValue(env: NodeJS.ProcessEnv, names: readonly string[]): string | undefined {
  for (const name of names) {
    const value = env[name];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

/** Validate one config field as a non-empty string, warning (not throwing) on bad input. */
function readStringField(value: unknown, field: string, path: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') {
    console.error(`[warn] proxy config "${field}" in ${path} must be a string; ignoring`);
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Read and validate the config file. Malformed input is ignored (warns), never thrown. */
function readConfigFile(path: string): ProxyConfig {
  if (!existsSync(path)) return {};

  let raw: string;
  try {
    raw = readFileSync(path, 'utf-8');
  } catch (err) {
    console.error(`[warn] could not read proxy config at ${path}: ${(err as Error).message}`);
    return {};
  }

  let parsed: RawConfig;
  try {
    parsed = JSON.parse(raw) as RawConfig;
  } catch (err) {
    console.error(`[warn] proxy config at ${path} is not valid JSON; ignoring: ${(err as Error).message}`);
    return {};
  }

  return {
    proxy: readStringField(parsed.proxy, 'proxy', path),
    noProxy: readStringField(parsed.noProxy, 'noProxy', path),
  };
}

/**
 * Load the effective proxy configuration by merging the config file with the
 * environment. Standard proxy env vars (HTTPS_PROXY / HTTP_PROXY / NO_PROXY,
 * upper- and lower-case) take precedence over the file so CI and containers can
 * override without editing the file.
 */
export function loadProxyConfig(env: NodeJS.ProcessEnv = process.env): ProxyConfig {
  const fromFile = readConfigFile(getConfigPath(env));

  const envProxy = envValue(env, ['HTTPS_PROXY', 'https_proxy', 'HTTP_PROXY', 'http_proxy']);
  const envNoProxy = envValue(env, ['NO_PROXY', 'no_proxy']);

  return {
    proxy: envProxy ?? fromFile.proxy,
    noProxy: envNoProxy ?? fromFile.noProxy,
  };
}

/**
 * Produce an environment for a child process that resolves/downloads the driver,
 * with the proxy settings injected explicitly. This is the key fix for
 * GUI-launched servers: the subprocess no longer relies on inherited shell env.
 */
export function buildSubprocessEnv(
  base: NodeJS.ProcessEnv,
  config: ProxyConfig,
): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...base };

  if (config.proxy) {
    env.HTTPS_PROXY = config.proxy;
    env.HTTP_PROXY = config.proxy;
    env.https_proxy = config.proxy;
    env.http_proxy = config.proxy;
  }

  if (config.noProxy) {
    env.NO_PROXY = config.noProxy;
    env.no_proxy = config.noProxy;
  }

  return env;
}
