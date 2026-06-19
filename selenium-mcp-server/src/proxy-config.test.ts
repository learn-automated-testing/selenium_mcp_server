import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import fs from 'node:fs';
import os from 'node:os';

import { loadProxyConfig, buildSubprocessEnv, getConfigPath } from './proxy-config.js';

describe('proxy-config', () => {
  let existsStub: sinon.SinonStub;
  let readStub: sinon.SinonStub;
  let homedirStub: sinon.SinonStub;
  let consoleErrorStub: sinon.SinonStub;

  beforeEach(() => {
    existsStub = sinon.stub(fs, 'existsSync');
    readStub = sinon.stub(fs, 'readFileSync');
    homedirStub = sinon.stub(os, 'homedir').returns('/home/testuser');
    consoleErrorStub = sinon.stub(console, 'error');

    // Default: no config file present
    existsStub.returns(false);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getConfigPath', () => {
    it('should default to ~/.selenium-ai-agent/config.json', () => {
      const path = getConfigPath({});
      const normalized = path.replace(/\\/g, '/');
      expect(normalized).to.equal('/home/testuser/.selenium-ai-agent/config.json');
    });

    it('should honour the SELENIUM_AI_AGENT_CONFIG override', () => {
      const path = getConfigPath({ SELENIUM_AI_AGENT_CONFIG: '/etc/selenium/cfg.json' });
      expect(path).to.equal('/etc/selenium/cfg.json');
    });
  });

  describe('loadProxyConfig', () => {
    it('should return an empty config when no file and no env vars exist', () => {
      const config = loadProxyConfig({});
      expect(config.proxy).to.equal(undefined);
      expect(config.noProxy).to.equal(undefined);
    });

    it('should read the proxy from the config file', () => {
      existsStub.returns(true);
      readStub.returns(JSON.stringify({ proxy: 'http://file-proxy:8080' }));

      const config = loadProxyConfig({});
      expect(config.proxy).to.equal('http://file-proxy:8080');
    });

    it('should let HTTPS_PROXY env var override the config file', () => {
      existsStub.returns(true);
      readStub.returns(JSON.stringify({ proxy: 'http://file-proxy:8080' }));

      const config = loadProxyConfig({ HTTPS_PROXY: 'http://env-proxy:3128' });
      expect(config.proxy).to.equal('http://env-proxy:3128');
    });

    it('should pick up the lower-case https_proxy env var', () => {
      const config = loadProxyConfig({ https_proxy: 'http://lower-proxy:3128' });
      expect(config.proxy).to.equal('http://lower-proxy:3128');
    });

    it('should fall back to HTTP_PROXY when HTTPS_PROXY is absent', () => {
      const config = loadProxyConfig({ HTTP_PROXY: 'http://http-only:3128' });
      expect(config.proxy).to.equal('http://http-only:3128');
    });

    it('should read NO_PROXY from the environment', () => {
      const config = loadProxyConfig({ NO_PROXY: 'localhost,127.0.0.1' });
      expect(config.noProxy).to.equal('localhost,127.0.0.1');
    });

    it('should ignore a malformed JSON config file without throwing', () => {
      existsStub.returns(true);
      readStub.returns('{ this is not json');

      const config = loadProxyConfig({});
      expect(config.proxy).to.equal(undefined);
      expect(consoleErrorStub.called).to.equal(true);
    });

    it('should ignore a non-string proxy field', () => {
      existsStub.returns(true);
      readStub.returns(JSON.stringify({ proxy: 1234 }));

      const config = loadProxyConfig({});
      expect(config.proxy).to.equal(undefined);
    });

    it('should treat a whitespace-only proxy value as unset', () => {
      existsStub.returns(true);
      readStub.returns(JSON.stringify({ proxy: '   ' }));

      const config = loadProxyConfig({});
      expect(config.proxy).to.equal(undefined);
    });
  });

  describe('buildSubprocessEnv', () => {
    it('should inject the proxy into both HTTP and HTTPS env vars', () => {
      const env = buildSubprocessEnv({}, { proxy: 'http://corp:8080' });
      expect(env.HTTPS_PROXY).to.equal('http://corp:8080');
      expect(env.HTTP_PROXY).to.equal('http://corp:8080');
      expect(env.https_proxy).to.equal('http://corp:8080');
      expect(env.http_proxy).to.equal('http://corp:8080');
    });

    it('should inject NO_PROXY when provided', () => {
      const env = buildSubprocessEnv({}, { noProxy: 'localhost' });
      expect(env.NO_PROXY).to.equal('localhost');
      expect(env.no_proxy).to.equal('localhost');
    });

    it('should preserve the base environment', () => {
      const env = buildSubprocessEnv({ PATH: '/usr/bin', FOO: 'bar' }, { proxy: 'http://corp:8080' });
      expect(env.PATH).to.equal('/usr/bin');
      expect(env.FOO).to.equal('bar');
    });

    it('should not set proxy vars when the config has no proxy', () => {
      const env = buildSubprocessEnv({ PATH: '/usr/bin' }, {});
      expect(env.HTTPS_PROXY).to.equal(undefined);
      expect(env.HTTP_PROXY).to.equal(undefined);
    });
  });
});
