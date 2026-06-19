import { describe, it, afterEach } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import https from 'node:https';
import { EventEmitter } from 'node:events';
import { deflateRawSync } from 'node:zlib';
import { existsSync, readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  cftPlatform,
  getCftBaseUrl,
  buildChromedriverUrl,
  extractFileFromZip,
  downloadBuffer,
  installChromedriver,
} from './driver-download.js';

/** Build a minimal ZIP (stored or deflate) from entries, for the extractor tests. */
function makeZip(files: Array<{ name: string; data: Buffer }>, method: 0 | 8 = 0): Buffer {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;

  for (const f of files) {
    const nameBuf = Buffer.from(f.name, 'utf8');
    const stored = method === 8 ? deflateRawSync(f.data) : f.data;

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(method, 8);
    local.writeUInt32LE(stored.length, 18);
    local.writeUInt32LE(f.data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    const localFull = Buffer.concat([local, nameBuf, stored]);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(method, 10);
    central.writeUInt32LE(stored.length, 20);
    central.writeUInt32LE(f.data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt32LE(offset, 42);
    const centralFull = Buffer.concat([central, nameBuf]);

    locals.push(localFull);
    centrals.push(centralFull);
    offset += localFull.length;
  }

  const localBlock = Buffer.concat(locals);
  const centralBlock = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralBlock.length, 12);
  eocd.writeUInt32LE(localBlock.length, 16);
  return Buffer.concat([localBlock, centralBlock, eocd]);
}

describe('driver-download', () => {
  afterEach(() => sinon.restore());

  describe('cftPlatform', () => {
    it('should map Apple Silicon macOS to mac-arm64', () => {
      expect(cftPlatform('darwin', 'arm64')).to.equal('mac-arm64');
    });

    it('should map Intel macOS to mac-x64', () => {
      expect(cftPlatform('darwin', 'x64')).to.equal('mac-x64');
    });

    it('should map 64-bit Linux to linux64', () => {
      expect(cftPlatform('linux', 'x64')).to.equal('linux64');
    });

    it('should map 64-bit Windows to win64', () => {
      expect(cftPlatform('win32', 'x64')).to.equal('win64');
    });

    it('should map 32-bit Windows to win32', () => {
      expect(cftPlatform('win32', 'ia32')).to.equal('win32');
    });

    it('should return null for platforms CfT does not publish (e.g. linux arm64)', () => {
      expect(cftPlatform('linux', 'arm64')).to.equal(null);
    });
  });

  describe('getCftBaseUrl / buildChromedriverUrl', () => {
    it('should default to the Chrome-for-Testing public storage host', () => {
      expect(getCftBaseUrl({})).to.equal('https://storage.googleapis.com/chrome-for-testing-public');
    });

    it('should honour the SE_CHROMEDRIVER_MIRROR override and strip trailing slashes', () => {
      expect(getCftBaseUrl({ SE_CHROMEDRIVER_MIRROR: 'https://mirror.corp/cft/' })).to.equal('https://mirror.corp/cft');
    });

    it('should build the exact-version download URL per platform', () => {
      const url = buildChromedriverUrl('149.0.7827.54', 'mac-arm64', 'https://host/base');
      expect(url).to.equal('https://host/base/149.0.7827.54/mac-arm64/chromedriver-mac-arm64.zip');
    });
  });

  describe('extractFileFromZip', () => {
    it('should extract a stored entry by basename, ignoring sibling files', () => {
      const zip = makeZip([
        { name: 'chromedriver-mac-arm64/LICENSE.chromedriver', data: Buffer.from('license') },
        { name: 'chromedriver-mac-arm64/chromedriver', data: Buffer.from('BINARY-DATA') },
      ]);
      expect(extractFileFromZip(zip, 'chromedriver').toString()).to.equal('BINARY-DATA');
    });

    it('should extract a deflate-compressed entry', () => {
      const payload = Buffer.from('x'.repeat(500));
      const zip = makeZip([{ name: 'chromedriver-linux64/chromedriver', data: payload }], 8);
      expect(extractFileFromZip(zip, 'chromedriver').equals(payload)).to.equal(true);
    });

    it('should throw when the requested file is absent', () => {
      const zip = makeZip([{ name: 'chromedriver-win64/LICENSE', data: Buffer.from('x') }]);
      expect(() => extractFileFromZip(zip, 'chromedriver.exe')).to.throw(/not found/);
    });
  });

  describe('downloadBuffer', () => {
    it('should force IPv4 (family: 4) by default', async () => {
      let captured: { family?: number; autoSelectFamily?: boolean } = {};
      sinon.stub(https, 'get').callsFake((_url: unknown, options: unknown, cb: unknown) => {
        captured = options as { family?: number };
        const res = new EventEmitter() as EventEmitter & { statusCode: number; headers: object; resume: () => void };
        res.statusCode = 200;
        res.headers = {};
        res.resume = () => undefined;
        (cb as (r: unknown) => void)(res);
        process.nextTick(() => res.emit('end'));
        return { setTimeout: () => undefined, on: () => undefined, destroy: () => undefined } as unknown as ReturnType<typeof https.get>;
      });

      await downloadBuffer('https://example.com/x.zip');
      expect(captured.family).to.equal(4);
    });

    it('should reject on a non-200 status', async () => {
      sinon.stub(https, 'get').callsFake((_url: unknown, _options: unknown, cb: unknown) => {
        const res = new EventEmitter() as EventEmitter & { statusCode: number; headers: object; resume: () => void };
        res.statusCode = 404;
        res.headers = {};
        res.resume = () => undefined;
        (cb as (r: unknown) => void)(res);
        return { setTimeout: () => undefined, on: () => undefined, destroy: () => undefined } as unknown as ReturnType<typeof https.get>;
      });

      let threw = false;
      try {
        await downloadBuffer('https://example.com/missing.zip');
      } catch (err) {
        threw = true;
        expect((err as Error).message).to.include('HTTP 404');
      }
      expect(threw).to.equal(true);
    });
  });

  describe('installChromedriver', () => {
    let cacheDir: string;

    afterEach(() => {
      if (cacheDir && existsSync(cacheDir)) rmSync(cacheDir, { recursive: true, force: true });
    });

    it('should download, extract and place the driver in the cache (macOS)', async () => {
      cacheDir = mkdtempSync(join(tmpdir(), 'dd-mac-'));
      const zip = makeZip([{ name: 'chromedriver-mac-arm64/chromedriver', data: Buffer.from('MAC-DRIVER') }]);
      const fetch = sinon.stub().resolves(zip);

      const dest = await installChromedriver(
        '149.0.7827.54',
        { plat: 'darwin', arch: 'arm64', cacheDir },
        fetch,
      );

      const expected = join(cacheDir, 'chromedriver', 'mac-arm64', '149.0.7827.54', 'chromedriver');
      expect(dest).to.equal(expected);
      expect(existsSync(dest)).to.equal(true);
      expect(readFileSync(dest).toString()).to.equal('MAC-DRIVER');
      // URL passed to the fetcher targets the storage host, not the metadata host.
      expect(fetch.firstCall.args[0]).to.include('storage.googleapis.com');
      expect(fetch.firstCall.args[0]).to.not.include('googlechromelabs.github.io');
    });

    it('should use the .exe name on Windows', async () => {
      cacheDir = mkdtempSync(join(tmpdir(), 'dd-win-'));
      const zip = makeZip([{ name: 'chromedriver-win64/chromedriver.exe', data: Buffer.from('WIN-DRIVER') }]);
      const fetch = sinon.stub().resolves(zip);

      const dest = await installChromedriver(
        '149.0.7827.54',
        { plat: 'win32', arch: 'x64', cacheDir },
        fetch,
      );

      expect(dest.endsWith('chromedriver.exe')).to.equal(true);
      expect(readFileSync(dest).toString()).to.equal('WIN-DRIVER');
    });

    it('should throw for an unsupported platform/arch instead of downloading', async () => {
      const fetch = sinon.stub().resolves(Buffer.alloc(0));
      let threw = false;
      try {
        await installChromedriver('149.0.0.0', { plat: 'linux', arch: 'arm64' }, fetch);
      } catch (err) {
        threw = true;
        expect((err as Error).message).to.include('no Chrome-for-Testing');
      }
      expect(threw).to.equal(true);
      expect(fetch.called).to.equal(false);
    });
  });
});
