import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import os from 'node:os';
import {
  classifyDriverError,
  getDiagnosticCommand,
  buildDriverErrorMessage,
  wrapDriverError,
  type ErrorCategory,
} from './driver-errors.js';

describe('classifyDriverError', () => {
  const cases: Array<{ input: string; expected: ErrorCategory }> = [
    { input: 'No route to host (os error 65)', expected: 'NETWORK_UNREACHABLE' },
    { input: 'tcp connect error on 1.2.3.4:443', expected: 'NETWORK_UNREACHABLE' },
    { input: 'network is unreachable', expected: 'NETWORK_UNREACHABLE' },
    { input: 'dns error: could not resolve', expected: 'NETWORK_UNREACHABLE' },
    { input: 'getaddrinfo ENOTFOUND googlechromelabs.github.io', expected: 'NETWORK_UNREACHABLE' },
    { input: 'connect ECONNREFUSED 127.0.0.1:4444', expected: 'NETWORK_UNREACHABLE' },
    { input: 'This version of ChromeDriver only supports Chrome version 146', expected: 'VERSION_MISMATCH' },
    { input: 'chrome version 148 detected at binary path /usr/bin/chrome', expected: 'VERSION_MISMATCH' },
    { input: 'Permission denied /home/user/.cache/selenium/chromedriver', expected: 'CACHE_PERMISSION' },
    { input: 'EACCES: permission denied, mkdir', expected: 'CACHE_PERMISSION' },
    { input: 'error sending request for url https://storage.googleapis.com/...', expected: 'DOWNLOAD_FAILED' },
    { input: 'download failed for chromedriver', expected: 'DOWNLOAD_FAILED' },
    { input: 'unable to download chrome driver', expected: 'DOWNLOAD_FAILED' },
    { input: 'some completely unknown error message', expected: 'UNKNOWN' },
  ];

  for (const { input, expected } of cases) {
    it(`should classify "${input.slice(0, 50)}..." as ${expected}`, () => {
      expect(classifyDriverError(input)).to.equal(expected);
    });
  }

  it('should use case-insensitive matching', () => {
    expect(classifyDriverError('NO ROUTE TO HOST')).to.equal('NETWORK_UNREACHABLE');
    expect(classifyDriverError('DOWNLOAD FAILED')).to.equal('DOWNLOAD_FAILED');
  });

  it('should return UNKNOWN for empty string', () => {
    expect(classifyDriverError('')).to.equal('UNKNOWN');
  });
});

describe('getDiagnosticCommand', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return macOS path on darwin', () => {
    sinon.stub(os, 'platform').returns('darwin');
    const cmd = getDiagnosticCommand();
    expect(cmd).to.include('bin/macos/selenium-manager');
    expect(cmd).to.include('--browser chrome --debug');
  });

  it('should return Windows path on win32', () => {
    sinon.stub(os, 'platform').returns('win32');
    const cmd = getDiagnosticCommand();
    expect(cmd).to.include('bin\\windows\\selenium-manager.exe');
    expect(cmd).to.include('--browser chrome --debug');
  });

  it('should return Linux path on linux', () => {
    sinon.stub(os, 'platform').returns('linux');
    const cmd = getDiagnosticCommand();
    expect(cmd).to.include('bin/linux/selenium-manager');
    expect(cmd).to.include('--browser chrome --debug');
  });
});

describe('buildDriverErrorMessage', () => {
  it('should include cause category in output', () => {
    const err = new Error('No route to host (os error 65)');
    const msg = buildDriverErrorMessage('NETWORK_UNREACHABLE', err);
    expect(msg).to.include('Cause: NETWORK_UNREACHABLE');
  });

  it('should include required hosts for NETWORK_UNREACHABLE', () => {
    const err = new Error('No route to host');
    const msg = buildDriverErrorMessage('NETWORK_UNREACHABLE', err);
    expect(msg).to.include('googlechromelabs.github.io');
    expect(msg).to.include('storage.googleapis.com');
  });

  it('should extract version numbers for VERSION_MISMATCH', () => {
    const err = new Error(
      'session not created: This version of ChromeDriver only supports Chrome version 146\n' +
      'Current browser version is 148.0.7778.98'
    );
    const msg = buildDriverErrorMessage('VERSION_MISMATCH', err);
    expect(msg).to.include('146');
    expect(msg).to.include('148.0.7778.98');
    expect(msg).to.include('npm update selenium-webdriver');
  });

  it('should include CHROMEDRIVER_PATH hint for VERSION_MISMATCH', () => {
    const err = new Error('only supports Chrome version 146\nCurrent browser version is 148.0.7778.98');
    const msg = buildDriverErrorMessage('VERSION_MISMATCH', err);
    expect(msg).to.include('CHROMEDRIVER_PATH');
  });

  it('should include cache fix for CACHE_PERMISSION', () => {
    const err = new Error('Permission denied .cache/selenium');
    const msg = buildDriverErrorMessage('CACHE_PERMISSION', err);
    expect(msg).to.include('chmod');
    expect(msg).to.include('.cache/selenium');
  });

  it('should include retry suggestion for DOWNLOAD_FAILED', () => {
    const err = new Error('error sending request for url');
    const msg = buildDriverErrorMessage('DOWNLOAD_FAILED', err);
    expect(msg).to.include('retry');
  });

  it('should include diagnostic command suggestion for UNKNOWN', () => {
    const err = new Error('something went wrong');
    const msg = buildDriverErrorMessage('UNKNOWN', err);
    expect(msg).to.include('diagnostic command');
  });

  it('should preserve original error message', () => {
    const originalMessage = 'the original error text here';
    const err = new Error(originalMessage);
    const msg = buildDriverErrorMessage('UNKNOWN', err);
    expect(msg).to.include('Original error:');
    expect(msg).to.include(originalMessage);
  });

  it('should include diagnostic command in output', () => {
    const err = new Error('No route to host');
    const msg = buildDriverErrorMessage('NETWORK_UNREACHABLE', err);
    expect(msg).to.include('To diagnose, run from the project directory:');
    expect(msg).to.include('selenium-manager');
  });

  it('should show local context by default', () => {
    const err = new Error('Unable to obtain browser driver');
    const msg = buildDriverErrorMessage('UNKNOWN', err);
    expect(msg).to.include('browser-driver acquisition failed');
  });

  it('should show grid context when specified', () => {
    const err = new Error('Unable to obtain browser driver');
    const msg = buildDriverErrorMessage('UNKNOWN', err, 'grid');
    expect(msg).to.include('Grid session creation failed');
    expect(msg).to.include('Grid diagnostics:');
    expect(msg).to.include('Verify Grid URL is reachable');
  });
});

describe('wrapDriverError', () => {
  it('should wrap driver acquisition errors', () => {
    const original = new Error('Unable to obtain browser driver: No route to host');
    const wrapped = wrapDriverError(original);
    expect(wrapped.message).to.include('Cause: NETWORK_UNREACHABLE');
    expect(wrapped.cause).to.equal(original);
  });

  it('should wrap version mismatch errors', () => {
    const original = new Error('This version of ChromeDriver only supports Chrome version 146');
    const wrapped = wrapDriverError(original);
    expect(wrapped.message).to.include('Cause: VERSION_MISMATCH');
    expect(wrapped.cause).to.equal(original);
  });

  it('should wrap session not created errors', () => {
    const original = new Error('session not created: Chrome failed to start');
    const wrapped = wrapDriverError(original);
    expect(wrapped).to.not.equal(original);
    expect(wrapped.cause).to.equal(original);
  });

  it('should pass through non-driver errors unchanged', () => {
    const original = new Error('some other error');
    const result = wrapDriverError(original);
    expect(result).to.equal(original);
  });

  it('should handle non-Error values', () => {
    const result = wrapDriverError('string error');
    expect(result).to.be.instanceOf(Error);
    expect(result.message).to.equal('string error');
  });

  it('should use grid context when specified', () => {
    const original = new Error('Unable to obtain browser driver');
    const wrapped = wrapDriverError(original, 'grid');
    expect(wrapped.message).to.include('Grid session creation failed');
  });
});
