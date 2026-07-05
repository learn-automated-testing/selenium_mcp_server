import { describe, it, afterEach } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { Context } from './context.js';

/**
 * Locks in the grid-routing behaviour of ensureBrowser(), which regressed once
 * before: the patch that routes browsing to the remote grid when
 * SELENIUM_GRID_URL is set lived only in a local build and was never published,
 * so the cloud silently launched a local browser instead (v3.3.3 fixed it).
 * v3.3.4 additionally recovers when the grid reaps the cached session.
 *
 * These are behavioural unit tests — ensureGrid()/createSession() are stubbed,
 * so no real grid or browser is needed and they run anywhere in CI.
 */
describe('Context.ensureBrowser — grid routing', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    sinon.restore();
    process.env = { ...originalEnv };
  });

  const fakeDriver = (over: Record<string, unknown> = {}) =>
    ({ getCurrentUrl: sinon.stub().resolves('https://example.com'), ...over }) as any;
  const fakeSession = (sessionId: string, driver: any) =>
    ({ sessionId, getDriver: () => driver }) as any;

  /** Stub ensureGrid so createSession returns our fake grid session. */
  function stubGrid(ctx: Context, createSession: sinon.SinonStub) {
    sinon.stub(ctx as any, 'ensureGrid').resolves({ pool: { createSession }, coordinator: {}, client: {} });
  }

  it('getGridUrl reflects SELENIUM_GRID_URL (the grid-vs-local gate)', () => {
    const ctx = new Context();
    delete process.env.SELENIUM_GRID_URL;
    expect(ctx.getGridUrl()).to.equal(null);
    process.env.SELENIUM_GRID_URL = 'http://grid:4444/grid';
    expect(ctx.getGridUrl()).to.equal('http://grid:4444/grid');
  });

  it('creates a grid session (not a local browser) when SELENIUM_GRID_URL is set', async () => {
    process.env.SELENIUM_GRID_URL = 'http://grid:4444/grid';
    const ctx = new Context();
    const driver = fakeDriver();
    const createSession = sinon.stub().resolves(fakeSession('grid-1', driver));
    stubGrid(ctx, createSession);

    const result = await ctx.ensureBrowser();

    expect(createSession.calledOnce, 'createSession should be called').to.equal(true);
    expect(result).to.equal(driver);
    expect((ctx as any).activeSessionId).to.equal('grid-1');
  });

  it('recreates the session when the cached grid session was reaped', async () => {
    process.env.SELENIUM_GRID_URL = 'http://grid:4444/grid';
    const ctx = new Context();

    // Seed a dead active session whose driver rejects the liveness probe.
    const deadDriver = fakeDriver({
      getCurrentUrl: sinon.stub().rejects(new Error('invalid session id: session was removed')),
    });
    (ctx as any).activeGridSession = fakeSession('grid-dead', deadDriver);
    (ctx as any).activeSessionId = 'grid-dead';

    const freshDriver = fakeDriver();
    const createSession = sinon.stub().resolves(fakeSession('grid-2', freshDriver));
    stubGrid(ctx, createSession);

    const result = await ctx.ensureBrowser();

    expect(createSession.calledOnce, 'should recreate after a dead session').to.equal(true);
    expect(result).to.equal(freshDriver);
    expect((ctx as any).activeSessionId).to.equal('grid-2');
  });

  it('reuses a live cached grid session without recreating it', async () => {
    process.env.SELENIUM_GRID_URL = 'http://grid:4444/grid';
    const ctx = new Context();

    const liveDriver = fakeDriver(); // getCurrentUrl resolves → alive
    (ctx as any).activeGridSession = fakeSession('grid-live', liveDriver);
    const createSession = sinon.stub().resolves(fakeSession('should-not-happen', fakeDriver()));
    stubGrid(ctx, createSession);

    const result = await ctx.ensureBrowser();

    expect(result).to.equal(liveDriver);
    expect(createSession.called, 'should NOT recreate a live session').to.equal(false);
  });
});
