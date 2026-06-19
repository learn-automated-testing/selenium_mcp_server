import { describe, it } from 'mocha';
import { expect } from 'chai';

import { runDoctor, formatDoctorReport, type DoctorDeps } from './doctor.js';

describe('doctor', () => {
  const happy: Partial<DoctorDeps> = {
    detectChrome: () => ({ version: '149.0.7827.155', major: 149 }),
    findCached: () => '/cache/chromedriver/win64/149.0.7827.155/chromedriver.exe',
    findOnPath: () => null,
    override: null,
    inspectManager: () => ({ path: '/sw/bin/macos/selenium-manager', exists: true, executable: true }),
    probe: async () => true,
    proxy: undefined,
    cacheDir: '/home/u/.cache/selenium',
  };

  it('should pass every check when Chrome, driver and network are healthy', async () => {
    const report = await runDoctor(happy);
    expect(report.ok).to.equal(true);
    expect(report.checks.find((c) => c.name === 'Chrome installed')!.ok).to.equal(true);
  });

  it('should show the resolved Selenium Manager path when it is executable', async () => {
    const report = await runDoctor(happy);
    const mgr = report.checks.find((c) => c.name === 'Selenium Manager binary')!;
    expect(mgr.ok).to.equal(true);
    expect(mgr.detail).to.include('/sw/bin/macos/selenium-manager');
  });

  it('should fail the manager check with the attempted path when the binary is missing', async () => {
    const report = await runDoctor({
      ...happy,
      inspectManager: () => ({ path: '/sw/bin/macos/selenium-manager', exists: false, executable: false }),
    });
    const mgr = report.checks.find((c) => c.name === 'Selenium Manager binary')!;
    expect(mgr.ok).to.equal(false);
    expect(mgr.detail).to.include('not found: /sw/bin/macos/selenium-manager');
    expect(report.ok).to.equal(false);
  });

  it('should fail the Chrome check with a fix when Chrome is absent', async () => {
    const report = await runDoctor({ ...happy, detectChrome: () => null });
    const chrome = report.checks.find((c) => c.name === 'Chrome installed')!;
    expect(chrome.ok).to.equal(false);
    expect(chrome.fix).to.be.a('string');
    expect(report.ok).to.equal(false);
  });

  describe('provisioning plan', () => {
    it('should show the direct strategy and storage URL when nothing is cached', async () => {
      const report = await runDoctor({ ...happy, findCached: () => null });
      const plan = report.checks.find((c) => c.name === 'Driver provisioning plan')!;
      expect(plan.ok).to.equal(true);
      expect(plan.detail).to.include('strategy: direct');
      expect(plan.detail).to.include('storage.googleapis.com');
      expect(plan.detail).to.include('149.0.7827.155');
    });

    it('should NOT fail the report just because no driver is cached yet', async () => {
      const report = await runDoctor({ ...happy, findCached: () => null });
      expect(report.ok).to.equal(true);
    });

    it('should show the override strategy when SE_CHROMEDRIVER is set', async () => {
      const report = await runDoctor({ ...happy, override: '/opt/chromedriver' });
      const plan = report.checks.find((c) => c.name === 'Driver provisioning plan')!;
      expect(plan.detail).to.include('strategy: override');
      expect(plan.detail).to.include('/opt/chromedriver');
    });

    it('should show the path strategy when chromedriver is on PATH', async () => {
      const report = await runDoctor({ ...happy, findCached: () => null, findOnPath: () => '/usr/bin/chromedriver' });
      const plan = report.checks.find((c) => c.name === 'Driver provisioning plan')!;
      expect(plan.detail).to.include('strategy: path');
    });
  });

  describe('host reachability', () => {
    it('should fail when the storage host is unreachable', async () => {
      const report = await runDoctor({ ...happy, probe: async (host) => host !== 'storage.googleapis.com' });
      const storage = report.checks.find((c) => c.name === 'Storage host (driver download)')!;
      expect(storage.ok).to.equal(false);
      expect(storage.fix).to.be.a('string');
      expect(report.ok).to.equal(false);
    });

    it('should NOT fail when only the metadata host is unreachable (the IPv6 case)', async () => {
      const report = await runDoctor({ ...happy, probe: async (host) => host !== 'googlechromelabs.github.io' });
      const metadata = report.checks.find((c) => c.name === 'Metadata host (fallback only)')!;
      expect(metadata.ok).to.equal(true);
      expect(metadata.detail).to.include('NOT reachable');
      // The storage path works, so the overall report is healthy.
      expect(report.ok).to.equal(true);
    });
  });

  describe('proxy', () => {
    it('should report proxy reachability when a proxy is configured', async () => {
      const report = await runDoctor({ ...happy, proxy: 'http://proxy.corp:8080', probe: async () => true });
      const proxy = report.checks.find((c) => c.name === 'Proxy reachable')!;
      expect(proxy.ok).to.equal(true);
      expect(proxy.detail).to.include('proxy.corp:8080');
    });

    it('should fail when the proxy is unreachable', async () => {
      const report = await runDoctor({ ...happy, proxy: 'http://proxy.corp:8080', probe: async () => false });
      const proxy = report.checks.find((c) => c.name === 'Proxy reachable')!;
      expect(proxy.ok).to.equal(false);
      expect(proxy.fix).to.be.a('string');
    });

    it('should flag a malformed proxy URL', async () => {
      const report = await runDoctor({ ...happy, proxy: 'not a url', probe: async () => true });
      const proxy = report.checks.find((c) => c.name === 'Proxy reachable')!;
      expect(proxy.ok).to.equal(false);
      expect(proxy.detail).to.include('not a valid URL');
    });
  });

  it('should render an actionable report with [X] and fix lines on failure', () => {
    const text = formatDoctorReport({
      ok: false,
      checks: [
        { name: 'Chrome installed', ok: false, detail: 'not found', fix: 'install Chrome' },
        { name: 'Driver cache location', ok: true, detail: '/cache' },
      ],
    });
    expect(text).to.include('[X]  Chrome installed');
    expect(text).to.include('fix: install Chrome');
    expect(text).to.include('Some checks failed');
  });
});
