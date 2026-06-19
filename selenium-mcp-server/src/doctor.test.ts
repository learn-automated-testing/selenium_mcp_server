import { describe, it } from 'mocha';
import { expect } from 'chai';

import { runDoctor, formatDoctorReport, type DoctorDeps } from './doctor.js';

describe('doctor', () => {
  const happy: Partial<DoctorDeps> = {
    detectChrome: () => ({ version: '149.0.7827.155', major: 149 }),
    findCached: () => '/cache/chromedriver/win64/149.0.7827.155/chromedriver.exe',
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
    expect(mgr.fix).to.be.a('string');
    expect(report.ok).to.equal(false);
  });

  it('should fail the manager check when selenium-webdriver cannot be resolved', async () => {
    const report = await runDoctor({
      ...happy,
      inspectManager: () => ({ path: null, exists: false, executable: false }),
    });
    const mgr = report.checks.find((c) => c.name === 'Selenium Manager binary')!;
    expect(mgr.ok).to.equal(false);
    expect(mgr.detail).to.include('could not be resolved');
  });

  it('should fail the Chrome check with a fix when Chrome is absent', async () => {
    const report = await runDoctor({ ...happy, detectChrome: () => null });
    const chrome = report.checks.find((c) => c.name === 'Chrome installed')!;
    expect(chrome.ok).to.equal(false);
    expect(chrome.fix).to.be.a('string');
    expect(report.ok).to.equal(false);
  });

  it('should fail the driver check when no matching cached driver exists', async () => {
    const report = await runDoctor({ ...happy, findCached: () => null });
    const driver = report.checks.find((c) => c.name === 'Matching driver ready')!;
    expect(driver.ok).to.equal(false);
    expect(driver.fix).to.include('SE_CACHE_PATH');
  });

  it('should report proxy reachability when a proxy is configured', async () => {
    const report = await runDoctor({ ...happy, proxy: 'http://proxy.corp:8080', probe: async () => true });
    const endpoint = report.checks.find((c) => c.name === 'Download endpoint reachable')!;
    expect(endpoint.ok).to.equal(true);
    expect(endpoint.detail).to.include('proxy.corp:8080');
  });

  it('should fail the endpoint check when the proxy is unreachable', async () => {
    const report = await runDoctor({ ...happy, proxy: 'http://proxy.corp:8080', probe: async () => false });
    const endpoint = report.checks.find((c) => c.name === 'Download endpoint reachable')!;
    expect(endpoint.ok).to.equal(false);
    expect(endpoint.fix).to.be.a('string');
  });

  it('should flag a malformed proxy URL', async () => {
    const report = await runDoctor({ ...happy, proxy: 'not a url', probe: async () => true });
    const endpoint = report.checks.find((c) => c.name === 'Download endpoint reachable')!;
    expect(endpoint.ok).to.equal(false);
    expect(endpoint.detail).to.include('not a valid URL');
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
