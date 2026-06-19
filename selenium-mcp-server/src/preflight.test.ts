import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { preflightCheck } from './preflight.js';
import type { DriverResolution, ResolveOptions } from './driver-provision.js';

describe('preflightCheck', () => {
  let consoleErrorStub: sinon.SinonStub;
  const originalEnv = { ...process.env };

  /** Build a resolver stub that resolves to a driver path. */
  function resolvingResolver(over: Partial<DriverResolution> = {}): sinon.SinonStub {
    return sinon.stub().resolves({ driverPath: '/cache/chromedriver', fromCache: false, ...over });
  }

  beforeEach(() => {
    consoleErrorStub = sinon.stub(console, 'error');
    delete process.env.SELENIUM_AI_AGENT_SKIP_PREFLIGHT;
    delete process.env.SELENIUM_AI_AGENT_PREFLIGHT_TIMEOUT_MS;
  });

  afterEach(() => {
    sinon.restore();
    process.env = { ...originalEnv };
  });

  it('should return ok when the driver resolves', async () => {
    const resolver = resolvingResolver();

    const result = await preflightCheck(resolver);

    expect(result.ok).to.equal(true);
    expect(resolver.calledOnce).to.equal(true);
  });

  it('should report whether the driver came from cache', async () => {
    const result = await preflightCheck(resolvingResolver({ fromCache: true, driverPath: '/c/d' }));

    expect(result.ok).to.equal(true);
    expect(result.fromCache).to.equal(true);
    expect(result.driverPath).to.equal('/c/d');
  });

  it('should skip when SELENIUM_AI_AGENT_SKIP_PREFLIGHT=1', async () => {
    process.env.SELENIUM_AI_AGENT_SKIP_PREFLIGHT = '1';
    const resolver = resolvingResolver();

    const result = await preflightCheck(resolver);

    expect(result.ok).to.equal(true);
    expect(resolver.called).to.equal(false);
  });

  it('should not skip when SELENIUM_AI_AGENT_SKIP_PREFLIGHT is not 1', async () => {
    process.env.SELENIUM_AI_AGENT_SKIP_PREFLIGHT = '0';
    const resolver = resolvingResolver();

    const result = await preflightCheck(resolver);

    expect(result.ok).to.equal(true);
    expect(resolver.called).to.equal(true);
  });

  it('should classify NETWORK_UNREACHABLE errors', async () => {
    const resolver = sinon.stub().rejects(new Error('No route to host (os error 65)'));

    const result = await preflightCheck(resolver);

    expect(result.ok).to.equal(false);
    expect(result.category).to.equal('NETWORK_UNREACHABLE');
  });

  it('should classify DOWNLOAD_FAILED errors', async () => {
    const resolver = sinon.stub().rejects(
      new Error('error sending request for url https://storage.googleapis.com/...'),
    );

    const result = await preflightCheck(resolver);

    expect(result.ok).to.equal(false);
    expect(result.category).to.equal('DOWNLOAD_FAILED');
  });

  it('should include a recommendation in the failure result', async () => {
    const resolver = sinon.stub().rejects(new Error('No route to host'));

    const result = await preflightCheck(resolver);

    expect(result.recommendation).to.be.a('string');
    expect(result.recommendation!.length).to.be.greaterThan(0);
  });

  it('should pass the configured timeout to the resolver', async () => {
    process.env.SELENIUM_AI_AGENT_PREFLIGHT_TIMEOUT_MS = '5000';
    const resolver = resolvingResolver();

    await preflightCheck(resolver);

    const opts = resolver.firstCall.args[0] as ResolveOptions;
    expect(opts.timeoutMs).to.equal(5000);
  });

  it('should use the default timeout for an invalid env var', async () => {
    process.env.SELENIUM_AI_AGENT_PREFLIGHT_TIMEOUT_MS = 'not-a-number';
    const resolver = resolvingResolver();

    await preflightCheck(resolver);

    const opts = resolver.firstCall.args[0] as ResolveOptions;
    expect(opts.timeoutMs).to.equal(30000);
  });
});
