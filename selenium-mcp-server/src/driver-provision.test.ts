import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import fs from 'node:fs';
import os from 'node:os';
import childProcess from 'node:child_process';

import {
  extractVersion,
  parseMajor,
  compareVersions,
  isValidDriverBinary,
  findCachedDriver,
  getSeleniumCacheDir,
  detectChromeVersion,
  resolveDriver,
  seleniumManagerRelativePath,
  getSeleniumManagerPath,
  getSeleniumWebdriverDir,
  resolveSeleniumManager,
  type ResolveDeps,
  type ChromeInfo,
} from './driver-provision.js';

describe('driver-provision', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('extractVersion', () => {
    it('should extract a full version from Selenium Manager text', () => {
      expect(extractVersion('Driver path: .../149.0.7827.155/chromedriver.exe')).to.equal('149.0.7827.155');
    });

    it('should extract a version from "Google Chrome 138.0.7204.49"', () => {
      expect(extractVersion('Google Chrome 138.0.7204.49 ')).to.equal('138.0.7204.49');
    });

    it('should return null when no version is present', () => {
      expect(extractVersion('no version here')).to.equal(null);
    });
  });

  describe('parseMajor', () => {
    it('should parse the major version from a full version', () => {
      expect(parseMajor('149.0.7827.155')).to.equal(149);
    });

    it('should return null for a non-numeric string', () => {
      expect(parseMajor('vNext')).to.equal(null);
    });
  });

  describe('compareVersions', () => {
    it('should order by numeric patch, not lexicographically', () => {
      // "149.0.7827.9" < "149.0.7827.20" numerically, but > lexicographically
      expect(compareVersions('149.0.7827.9', '149.0.7827.20')).to.be.lessThan(0);
    });

    it('should return 0 for equal versions', () => {
      expect(compareVersions('149.0.1.2', '149.0.1.2')).to.equal(0);
    });
  });

  describe('isValidDriverBinary', () => {
    let existsStub: sinon.SinonStub;
    let statStub: sinon.SinonStub;
    let platformStub: sinon.SinonStub;

    beforeEach(() => {
      existsStub = sinon.stub(fs, 'existsSync').returns(true);
      statStub = sinon.stub(fs, 'statSync');
      platformStub = sinon.stub(os, 'platform').returns('linux');
    });

    function fakeStat(overrides: Partial<{ isFile: boolean; size: number; mode: number }>): unknown {
      return {
        isFile: () => overrides.isFile ?? true,
        size: overrides.size ?? 1000,
        mode: overrides.mode ?? 0o755,
      };
    }

    it('should reject a .zip path without touching the filesystem', () => {
      const result = isValidDriverBinary('/cache/chromedriver/linux64/149.0.0.0/chromedriver.zip');
      expect(result).to.equal(false);
    });

    it('should reject a path that does not exist', () => {
      existsStub.returns(false);
      expect(isValidDriverBinary('/cache/.../chromedriver')).to.equal(false);
    });

    it('should reject a zero-byte file', () => {
      statStub.returns(fakeStat({ size: 0 }));
      expect(isValidDriverBinary('/cache/.../chromedriver')).to.equal(false);
    });

    it('should reject a non-executable file on POSIX', () => {
      statStub.returns(fakeStat({ mode: 0o644 }));
      expect(isValidDriverBinary('/cache/.../chromedriver')).to.equal(false);
    });

    it('should accept an executable file on POSIX', () => {
      statStub.returns(fakeStat({ mode: 0o755 }));
      expect(isValidDriverBinary('/cache/.../chromedriver')).to.equal(true);
    });

    it('should require an .exe extension on Windows', () => {
      platformStub.returns('win32');
      statStub.returns(fakeStat({ mode: 0o644 }));
      expect(isValidDriverBinary('C:\\cache\\chromedriver')).to.equal(false);
      expect(isValidDriverBinary('C:\\cache\\chromedriver.exe')).to.equal(true);
    });
  });

  describe('detectChromeVersion', () => {
    let execStub: sinon.SinonStub;

    beforeEach(() => {
      execStub = sinon.stub(childProcess, 'execFileSync');
      sinon.stub(os, 'homedir').returns('/Users/tester');
    });

    it('should detect Chrome on macOS from the standard Applications path', () => {
      sinon.stub(os, 'platform').returns('darwin');
      execStub.returns('Google Chrome 150.0.1.2 \n');

      const info = detectChromeVersion();
      expect(info).to.not.equal(null);
      expect(info!.version).to.equal('150.0.1.2');
      expect(info!.major).to.equal(150);
    });

    it('should fall back to ~/Applications on macOS when the system path fails', () => {
      sinon.stub(os, 'platform').returns('darwin');
      execStub.onFirstCall().throws(new Error('ENOENT'));
      execStub.onSecondCall().returns('Google Chrome 151.0.0.0');

      const info = detectChromeVersion();
      expect(info!.major).to.equal(151);
      const homeArg = (execStub.secondCall.args[0] as string).replace(/\\/g, '/');
      expect(homeArg).to.include('/Users/tester/Applications');
    });

    it('should return null on macOS when Chrome is not found anywhere', () => {
      sinon.stub(os, 'platform').returns('darwin');
      execStub.throws(new Error('ENOENT'));

      expect(detectChromeVersion()).to.equal(null);
    });
  });

  describe('seleniumManagerRelativePath', () => {
    it('should use the macos binary on darwin', () => {
      expect(seleniumManagerRelativePath('darwin')).to.equal('bin/macos/selenium-manager');
    });

    it('should use the windows .exe binary on win32', () => {
      expect(seleniumManagerRelativePath('win32')).to.equal('bin/windows/selenium-manager.exe');
    });

    it('should use the linux binary on linux', () => {
      expect(seleniumManagerRelativePath('linux')).to.equal('bin/linux/selenium-manager');
    });
  });

  describe('getSeleniumManagerPath', () => {
    it('should join the injected base dir with the macOS sub-path', () => {
      const p = getSeleniumManagerPath('darwin', '/fake/selenium-webdriver').replace(/\\/g, '/');
      expect(p).to.equal('/fake/selenium-webdriver/bin/macos/selenium-manager');
    });

    it('should append .exe under the windows sub-path', () => {
      const p = getSeleniumManagerPath('win32', '/fake/selenium-webdriver').replace(/\\/g, '/');
      expect(p).to.equal('/fake/selenium-webdriver/bin/windows/selenium-manager.exe');
    });

    it('should join the injected base dir with the linux sub-path', () => {
      const p = getSeleniumManagerPath('linux', '/fake/selenium-webdriver').replace(/\\/g, '/');
      expect(p).to.equal('/fake/selenium-webdriver/bin/linux/selenium-manager');
    });

    it('should default the base to the real selenium-webdriver install (not cwd)', () => {
      // The real package is resolvable in this repo; the path must live under it,
      // never starting from the filesystem root as the old cwd-based lookup did.
      const dir = getSeleniumWebdriverDir().replace(/\\/g, '/');
      expect(dir).to.include('selenium-webdriver');
      const p = getSeleniumManagerPath().replace(/\\/g, '/');
      expect(p.startsWith(dir)).to.equal(true);
      expect(p.startsWith('/node_modules/')).to.equal(false);
    });
  });

  describe('resolveSeleniumManager', () => {
    it('should throw with the attempted path and a hint when the binary is missing', () => {
      sinon.stub(fs, 'existsSync').returns(false);

      let thrown: Error | null = null;
      try {
        resolveSeleniumManager();
      } catch (err) {
        thrown = err as Error;
      }

      expect(thrown).to.not.equal(null);
      expect(thrown!.message).to.include('Selenium Manager binary not found at:');
      expect(thrown!.message.toLowerCase()).to.include('reinstall');
    });
  });

  describe('getSeleniumCacheDir', () => {
    it('should default to ~/.cache/selenium on all platforms', () => {
      sinon.stub(os, 'homedir').returns('/home/testuser');
      const dir = getSeleniumCacheDir({}).replace(/\\/g, '/');
      expect(dir).to.equal('/home/testuser/.cache/selenium');
    });

    it('should honour SE_CACHE_PATH', () => {
      expect(getSeleniumCacheDir({ SE_CACHE_PATH: '/custom/cache' })).to.equal('/custom/cache');
    });
  });

  describe('findCachedDriver', () => {
    let existsStub: sinon.SinonStub;
    let readdirStub: sinon.SinonStub;
    let statStub: sinon.SinonStub;

    beforeEach(() => {
      sinon.stub(os, 'platform').returns('linux');
      existsStub = sinon.stub(fs, 'existsSync').returns(true);
      readdirStub = sinon.stub(fs, 'readdirSync');
      statStub = sinon.stub(fs, 'statSync').returns({
        isFile: () => true,
        size: 1000,
        mode: 0o755,
      } as unknown as fs.Stats);
    });

    it('should return a cached driver whose major version matches', () => {
      readdirStub.withArgs(sinon.match(/chromedriver$/)).returns(['linux64']);
      readdirStub.withArgs(sinon.match(/linux64$/)).returns(['149.0.7827.155']);

      const result = findCachedDriver(149, '/cache');
      expect(result).to.be.a('string');
      expect(result!.replace(/\\/g, '/')).to.include('149.0.7827.155/chromedriver');
    });

    it('should return null when no cached version matches the major', () => {
      readdirStub.withArgs(sinon.match(/chromedriver$/)).returns(['linux64']);
      readdirStub.withArgs(sinon.match(/linux64$/)).returns(['148.0.7777.0']);

      expect(findCachedDriver(149, '/cache')).to.equal(null);
    });

    it('should prefer the highest patch version for the major', () => {
      readdirStub.withArgs(sinon.match(/chromedriver$/)).returns(['linux64']);
      readdirStub.withArgs(sinon.match(/linux64$/)).returns(['149.0.7827.9', '149.0.7827.155']);

      const result = findCachedDriver(149, '/cache')!.replace(/\\/g, '/');
      expect(result).to.include('149.0.7827.155/chromedriver');
    });

    it('should return null when the cache root does not exist', () => {
      existsStub.returns(false);
      expect(findCachedDriver(149, '/cache')).to.equal(null);
    });
  });

  describe('resolveDriver', () => {
    const chrome: ChromeInfo = { version: '149.0.7827.155', major: 149 };
    const DIRECT = '/cache/chromedriver/win64/149.0.7827.155/chromedriver';
    const MANAGER = '/cache/chromedriver/linux64/149.0.7827.155/chromedriver';

    // By default the network paths are disabled: direct download throws so tests
    // exercise the fallback explicitly, and PATH/override are absent.
    function baseDeps(over: Partial<ResolveDeps>): Partial<ResolveDeps> {
      return {
        detectChrome: () => chrome,
        findOverride: () => null,
        findOnPath: () => null,
        findCached: () => null,
        installDirect: async () => { throw new Error('direct download disabled in test'); },
        runManager: () => MANAGER,
        validate: () => true,
        removeEntry: () => undefined,
        sleep: async () => undefined,
        ...over,
      };
    }

    it('should use the SE_CHROMEDRIVER override without any network call', async () => {
      const installDirect = sinon.stub().rejects(new Error('should not be called'));
      const runManager = sinon.stub().throws(new Error('should not be called'));

      const result = await resolveDriver({}, baseDeps({
        findOverride: () => '/opt/chromedriver',
        installDirect,
        runManager,
      }));

      expect(result.strategy).to.equal('override');
      expect(result.fromCache).to.equal(true);
      expect(result.driverPath).to.equal('/opt/chromedriver');
      expect(installDirect.called).to.equal(false);
      expect(runManager.called).to.equal(false);
    });

    it('should use a chromedriver found on PATH without any network call', async () => {
      const installDirect = sinon.stub().rejects(new Error('should not be called'));
      const result = await resolveDriver({}, baseDeps({
        findOnPath: () => '/usr/local/bin/chromedriver',
        installDirect,
      }));

      expect(result.strategy).to.equal('path');
      expect(installDirect.called).to.equal(false);
    });

    it('should reuse a cached driver without downloading', async () => {
      const installDirect = sinon.stub().rejects(new Error('should not be called'));
      const result = await resolveDriver({}, baseDeps({
        findCached: () => DIRECT,
        installDirect,
      }));

      expect(result.strategy).to.equal('cache');
      expect(result.fromCache).to.equal(true);
      expect(installDirect.called).to.equal(false);
    });

    it('should prefer the direct download over Selenium Manager', async () => {
      const installDirect = sinon.stub().resolves(DIRECT);
      const runManager = sinon.stub().throws(new Error('should not be called'));

      const result = await resolveDriver({}, baseDeps({ installDirect, runManager }));

      expect(result.strategy).to.equal('direct');
      expect(result.fromCache).to.equal(false);
      expect(result.driverPath).to.equal(DIRECT);
      expect(runManager.called).to.equal(false);
    });

    it('should fall back to Selenium Manager when the direct download fails', async () => {
      const installDirect = sinon.stub().rejects(new Error('No route to host'));
      const runManager = sinon.stub().returns(MANAGER);

      const result = await resolveDriver({ baseDelayMs: 0 }, baseDeps({ installDirect, runManager }));

      expect(result.strategy).to.equal('fallback');
      expect(installDirect.called).to.equal(true);
      expect(runManager.called).to.equal(true);
    });

    it('should skip the direct download when Chrome cannot be detected', async () => {
      const installDirect = sinon.stub().rejects(new Error('should not be called'));
      const result = await resolveDriver({}, baseDeps({
        detectChrome: () => null,
        installDirect,
      }));

      expect(result.strategy).to.equal('fallback');
      expect(installDirect.called).to.equal(false);
    });

    it('should repair a corrupt fallback entry and retry', async () => {
      const removeEntry = sinon.stub();
      const validate = sinon.stub();
      validate.onFirstCall().returns(false); // corrupt
      validate.onSecondCall().returns(true); // good after repair

      const result = await resolveDriver({ baseDelayMs: 0 }, baseDeps({
        validate,
        removeEntry,
      }));

      expect(removeEntry.calledOnce).to.equal(true);
      expect(result.fromCache).to.equal(false);
    });

    it('should retry transient failures with backoff', async () => {
      const sleep = sinon.stub().resolves();
      const runManager = sinon.stub();
      runManager.onFirstCall().throws(new Error('error sending request for url'));
      runManager.onSecondCall().returns(MANAGER);

      const result = await resolveDriver({ baseDelayMs: 10 }, baseDeps({ runManager, sleep }));

      expect(runManager.calledTwice).to.equal(true);
      expect(sleep.calledOnce).to.equal(true);
      expect(result.driverPath).to.include('chromedriver');
    });

    it('should throw a clear error after exhausting retries', async () => {
      const runManager = sinon.stub().throws(new Error('no route to host'));

      let thrown: Error | null = null;
      try {
        await resolveDriver({ maxRetries: 2, baseDelayMs: 0 }, baseDeps({ runManager }));
      } catch (err) {
        thrown = err as Error;
      }

      expect(thrown).to.not.equal(null);
      expect(thrown!.message).to.include('failed after 2 attempt');
      expect(runManager.calledTwice).to.equal(true);
    });
  });
});
