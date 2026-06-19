import { mkdirSync, writeFileSync, chmodSync } from 'node:fs';
import { join } from 'node:path';
import { platform, arch } from 'node:os';
import { execFileSync } from 'node:child_process';
import https from 'node:https';
import { inflateRawSync } from 'node:zlib';
import { getSeleniumCacheDir } from './driver-provision.js';

/** Default Chrome-for-Testing public storage host (no metadata host involved). */
const DEFAULT_CFT_BASE = 'https://storage.googleapis.com/chrome-for-testing-public';

/**
 * Map process.platform + process.arch to a Chrome-for-Testing platform token.
 * Returns null for combinations CfT does not publish (→ caller falls back).
 */
export function cftPlatform(
  plat: NodeJS.Platform = platform(),
  architecture: string = arch(),
): string | null {
  switch (plat) {
    case 'darwin':
      return architecture === 'arm64' ? 'mac-arm64' : 'mac-x64';
    case 'linux':
      return architecture === 'x64' ? 'linux64' : null; // CfT publishes linux64 only
    case 'win32':
      return architecture === 'ia32' ? 'win32' : 'win64';
    default:
      return null;
  }
}

/** Base URL for driver downloads — overridable for mirrors / air-gapped setups. */
export function getCftBaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const override = env.SE_CHROMEDRIVER_MIRROR?.trim();
  return (override || DEFAULT_CFT_BASE).replace(/\/+$/, '');
}

/** Build the direct chromedriver .zip URL for an exact Chrome version. */
export function buildChromedriverUrl(
  version: string,
  cftPlat: string,
  baseUrl: string = getCftBaseUrl(),
): string {
  return `${baseUrl}/${version}/${cftPlat}/chromedriver-${cftPlat}.zip`;
}

// ---------------------------------------------------------------------------
// Download (IPv4-forced, redirect-following, retried)
// ---------------------------------------------------------------------------

export interface DownloadOptions {
  /** 4 = force IPv4 (avoids broken IPv6 routes / "No route to host"). 0 = auto. */
  readonly family?: 0 | 4 | 6;
  readonly maxRedirects?: number;
  readonly timeoutMs?: number;
}

/** Download a URL into a Buffer over a single connection (one attempt). */
export function downloadBuffer(url: string, opts: DownloadOptions = {}): Promise<Buffer> {
  const { family = 4, maxRedirects = 5, timeoutMs = 60_000 } = opts;

  return new Promise<Buffer>((resolve, reject) => {
    // family:4 forces IPv4 DNS resolution (avoids broken IPv6 routes); family:0
    // leaves Node's default happy-eyeballs (auto IPv4/IPv6) in place.
    const reqOptions: https.RequestOptions = {};
    if (family !== 0) reqOptions.family = family;

    const req = https.get(
      url,
      reqOptions,
      (res) => {
        const status = res.statusCode ?? 0;

        if (status >= 300 && status < 400 && res.headers.location) {
          res.resume();
          if (maxRedirects <= 0) {
            reject(new Error(`too many redirects for ${url}`));
            return;
          }
          const next = new URL(res.headers.location, url).toString();
          downloadBuffer(next, { ...opts, maxRedirects: maxRedirects - 1 }).then(resolve, reject);
          return;
        }

        if (status !== 200) {
          res.resume();
          reject(new Error(`GET ${url} returned HTTP ${status}`));
          return;
        }

        const chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      },
    );

    req.setTimeout(timeoutMs, () => req.destroy(new Error(`download timed out after ${timeoutMs}ms: ${url}`)));
    req.on('error', reject);
  });
}

const delay = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

export interface RetryOptions extends DownloadOptions {
  readonly retries?: number;
  readonly baseDelayMs?: number;
}

/** Download with exponential backoff on transient failures. */
export async function downloadWithRetry(url: string, opts: RetryOptions = {}): Promise<Buffer> {
  const { retries = 3, baseDelayMs = 500, ...dl } = opts;
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < retries; attempt++) {
    if (attempt > 0) await delay(baseDelayMs * 2 ** (attempt - 1));
    try {
      return await downloadBuffer(url, dl);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw new Error(`download failed after ${retries} attempt(s): ${lastError?.message ?? 'unknown error'}`);
}

// ---------------------------------------------------------------------------
// Minimal ZIP reader (node:zlib only — no dependency)
// Handles stored (0) and deflate (8); the chromedriver zips use these.
// ---------------------------------------------------------------------------

interface ZipEntry {
  readonly name: string;
  readonly method: number;
  readonly compressedSize: number;
  readonly localHeaderOffset: number;
}

function parseCentralDirectory(buf: Buffer): ZipEntry[] {
  const EOCD_SIG = 0x06054b50;
  const CD_SIG = 0x02014b50;

  let eocd = -1;
  for (let i = buf.length - 22; i >= 0; i--) {
    if (buf.readUInt32LE(i) === EOCD_SIG) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error('zip: end-of-central-directory record not found');

  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);

  const entries: ZipEntry[] = [];
  for (let i = 0; i < count; i++) {
    if (buf.readUInt32LE(p) !== CD_SIG) break;
    const method = buf.readUInt16LE(p + 10);
    const compressedSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localHeaderOffset = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    entries.push({ name, method, compressedSize, localHeaderOffset });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

function readEntryData(buf: Buffer, entry: ZipEntry): Buffer {
  const LF_SIG = 0x04034b50;
  const off = entry.localHeaderOffset;
  if (buf.readUInt32LE(off) !== LF_SIG) throw new Error('zip: bad local file header');

  // Lengths in the local header can differ from the central directory; trust local.
  const nameLen = buf.readUInt16LE(off + 26);
  const extraLen = buf.readUInt16LE(off + 28);
  const dataStart = off + 30 + nameLen + extraLen;
  const compressed = buf.subarray(dataStart, dataStart + entry.compressedSize);

  if (entry.method === 0) return Buffer.from(compressed); // stored
  if (entry.method === 8) return inflateRawSync(compressed); // deflate
  throw new Error(`zip: unsupported compression method ${entry.method}`);
}

/** Extract a single file (by basename) from a chromedriver zip buffer. */
export function extractFileFromZip(zipBuf: Buffer, basename: string): Buffer {
  const entries = parseCentralDirectory(zipBuf);
  const target = entries.find((e) => e.name === basename || e.name.endsWith(`/${basename}`));
  if (!target) {
    throw new Error(`zip: "${basename}" not found (entries: ${entries.map((e) => e.name).join(', ')})`);
  }
  return readEntryData(zipBuf, target);
}

// ---------------------------------------------------------------------------
// Install
// ---------------------------------------------------------------------------

export interface InstallOptions {
  readonly baseUrl?: string;
  readonly plat?: NodeJS.Platform;
  readonly arch?: string;
  readonly cacheDir?: string;
  readonly retry?: RetryOptions;
}

/** Download function, injectable so tests never touch the network. */
export type Fetcher = (url: string, opts?: RetryOptions) => Promise<Buffer>;

/**
 * Download chromedriver for an exact Chrome version directly from the
 * Chrome-for-Testing storage host (never the metadata host), extract it into
 * the Selenium cache where the resolver expects it, make it executable and
 * clear the macOS quarantine flag. Returns the installed driver path.
 */
export async function installChromedriver(
  version: string,
  opts: InstallOptions = {},
  fetch: Fetcher = downloadWithRetry,
): Promise<string> {
  const plat = opts.plat ?? platform();
  const cftPlat = cftPlatform(plat, opts.arch ?? arch());
  if (!cftPlat) {
    throw new Error(`no Chrome-for-Testing chromedriver is published for ${plat}/${opts.arch ?? arch()}`);
  }

  const baseUrl = opts.baseUrl ?? getCftBaseUrl();
  const url = buildChromedriverUrl(version, cftPlat, baseUrl);
  const exeName = plat === 'win32' ? 'chromedriver.exe' : 'chromedriver';
  const cacheDir = opts.cacheDir ?? getSeleniumCacheDir();

  const zipBuf = await fetch(url, opts.retry);
  const exeBuf = extractFileFromZip(zipBuf, exeName);

  const destDir = join(cacheDir, 'chromedriver', cftPlat, version);
  mkdirSync(destDir, { recursive: true });
  const destPath = join(destDir, exeName);
  writeFileSync(destPath, exeBuf);

  if (plat !== 'win32') {
    chmodSync(destPath, 0o755);
  }
  if (plat === 'darwin') {
    // Downloaded files get a quarantine xattr that blocks execution; clear it.
    try {
      execFileSync('xattr', ['-d', 'com.apple.quarantine', destPath], { stdio: 'ignore' });
    } catch {
      /* not quarantined — fine */
    }
  }

  return destPath;
}
