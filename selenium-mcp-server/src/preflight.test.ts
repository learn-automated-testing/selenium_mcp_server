import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import childProcess from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';

// Must import after stubs are set up — but ESM imports are hoisted.
// We use dynamic import inside tests to work around this.
// However, since the module reads platform() at call time (not import time),
// we can stub os.platform before calling the functions.

import { preflightCheck } from './preflight.js';

describe('preflightCheck', () => {
  let execFileStub: sinon.SinonStub;
  let existsStub: sinon.SinonStub;
  let rmStub: sinon.SinonStub;
  let platformStub: sinon.SinonStub;
  let homedirStub: sinon.SinonStub;
  let consoleErrorStub: sinon.SinonStub;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    execFileStub = sinon.stub(childProcess, 'execFileSync');
    existsStub = sinon.stub(fs, 'existsSync');
    rmStub = sinon.stub(fs, 'rmSync');
    platformStub = sinon.stub(os, 'platform').returns('linux');
    homedirStub = sinon.stub(os, 'homedir').returns('/home/testuser');
    consoleErrorStub = sinon.stub(console, 'error');

    // Default: binary exists
    existsStub.returns(true);

    // Clean env
    delete process.env.SELENIUM_AI_AGENT_SKIP_PREFLIGHT;
    delete process.env.SELENIUM_AI_AGENT_PREFLIGHT_TIMEOUT_MS;
  });

  afterEach(() => {
    sinon.restore();
    process.env = { ...originalEnv };
  });

  it('should return ok when Selenium Manager succeeds', async () => {
    execFileStub.returns('{"result": {}}');

    const result = await preflightCheck();

    expect(result.ok).to.equal(true);
    expect(execFileStub.calledOnce).to.equal(true);
  });

  it('should skip when SELENIUM_AI_AGENT_SKIP_PREFLIGHT=1', async () => {
    process.env.SELENIUM_AI_AGENT_SKIP_PREFLIGHT = '1';

    const result = await preflightCheck();

    expect(result.ok).to.equal(true);
    expect(execFileStub.called).to.equal(false);
  });

  it('should not skip when SELENIUM_AI_AGENT_SKIP_PREFLIGHT is not 1', async () => {
    process.env.SELENIUM_AI_AGENT_SKIP_PREFLIGHT = '0';
    execFileStub.returns('{}');

    const result = await preflightCheck();

    expect(result.ok).to.equal(true);
    expect(execFileStub.called).to.equal(true);
  });

  it('should fail when binary is not found', async () => {
    existsStub.returns(false);

    const result = await preflightCheck();

    expect(result.ok).to.equal(false);
    expect(result.category).to.equal('UNKNOWN');
    expect(result.stderr).to.include('not found');
  });

  it('should classify NETWORK_UNREACHABLE errors', async () => {
    const error = new Error('Command failed') as Error & { stderr: string };
    error.stderr = 'No route to host (os error 65)';
    execFileStub.throws(error);

    const result = await preflightCheck();

    expect(result.ok).to.equal(false);
    expect(result.category).to.equal('NETWORK_UNREACHABLE');
  });

  it('should classify DOWNLOAD_FAILED errors', async () => {
    const error = new Error('Command failed') as Error & { stderr: string };
    error.stderr = 'error sending request for url https://storage.googleapis.com/...';
    execFileStub.throws(error);

    const result = await preflightCheck();

    expect(result.ok).to.equal(false);
    expect(result.category).to.equal('DOWNLOAD_FAILED');
  });

  it('should auto-recover by clearing cache and retrying', async () => {
    const error = new Error('Command failed') as Error & { stderr: string };
    error.stderr = 'No route to host';

    // First call fails, second succeeds
    execFileStub.onFirstCall().throws(error);
    execFileStub.onSecondCall().returns('{}');

    const result = await preflightCheck();

    expect(result.ok).to.equal(true);
    expect(execFileStub.calledTwice).to.equal(true);
    expect(rmStub.called).to.equal(true);
  });

  it('should fail after retry if both attempts fail', async () => {
    const error = new Error('Command failed') as Error & { stderr: string };
    error.stderr = 'No route to host';
    execFileStub.throws(error);

    const result = await preflightCheck();

    expect(result.ok).to.equal(false);
    expect(execFileStub.calledTwice).to.equal(true);
  });

  it('should handle cache clear failure gracefully', async () => {
    const error = new Error('Command failed') as Error & { stderr: string };
    error.stderr = 'No route to host';
    execFileStub.throws(error);
    rmStub.throws(new Error('EPERM'));

    const result = await preflightCheck();

    expect(result.ok).to.equal(false);
    // Should not throw — cache clear is best-effort
  });

  it('should use custom timeout from env var', async () => {
    process.env.SELENIUM_AI_AGENT_PREFLIGHT_TIMEOUT_MS = '5000';
    execFileStub.returns('{}');

    await preflightCheck();

    const callArgs = execFileStub.firstCall.args;
    expect(callArgs[2]).to.have.property('timeout', 5000);
  });

  it('should use default timeout for invalid env var', async () => {
    process.env.SELENIUM_AI_AGENT_PREFLIGHT_TIMEOUT_MS = 'not-a-number';
    execFileStub.returns('{}');

    await preflightCheck();

    const callArgs = execFileStub.firstCall.args;
    expect(callArgs[2]).to.have.property('timeout', 30000);
  });

  it('should use default timeout for negative env var', async () => {
    process.env.SELENIUM_AI_AGENT_PREFLIGHT_TIMEOUT_MS = '-1';
    execFileStub.returns('{}');

    await preflightCheck();

    const callArgs = execFileStub.firstCall.args;
    expect(callArgs[2]).to.have.property('timeout', 30000);
  });

  it('should resolve linux binary path', async () => {
    platformStub.returns('linux');
    execFileStub.returns('{}');

    await preflightCheck();

    const binaryPath = execFileStub.firstCall.args[0] as string;
    // Normalize separators for cross-platform assertion
    const normalized = binaryPath.replace(/\\/g, '/');
    expect(normalized).to.include('bin/linux/selenium-manager');
  });

  it('should resolve windows binary path', async () => {
    platformStub.returns('win32');
    execFileStub.returns('{}');

    await preflightCheck();

    const binaryPath = execFileStub.firstCall.args[0] as string;
    expect(binaryPath).to.include('selenium-manager.exe');
  });

  it('should resolve macOS binary path', async () => {
    platformStub.returns('darwin');
    execFileStub.returns('{}');

    await preflightCheck();

    const binaryPath = execFileStub.firstCall.args[0] as string;
    const normalized = binaryPath.replace(/\\/g, '/');
    expect(normalized).to.include('bin/macos/selenium-manager');
  });

  it('should include recommendation in failure result', async () => {
    const error = new Error('Command failed') as Error & { stderr: string };
    error.stderr = 'No route to host';
    execFileStub.throws(error);

    const result = await preflightCheck();

    expect(result.recommendation).to.be.a('string');
    expect(result.recommendation!.length).to.be.greaterThan(0);
  });
});
