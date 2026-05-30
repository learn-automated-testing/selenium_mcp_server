// Smoke test: does attach-mode + BiDi work with the current chromedriver?
//
// Prereq: launch a Chrome (or Electron/Studio) with remote debugging:
//   chrome.exe --remote-debugging-port=9222 https://example.com
//
// Run from selenium-mcp-server/:
//   node scripts/test-attach-bidi.mjs
// Optional env:
//   ATTACH_ADDR=127.0.0.1:9222
//   TARGET_URL=example.com           (substring to identify the app-under-test)
//   SELENIUM_CHROMEDRIVER=<path>     (pin chromedriver; otherwise selenium-manager)
//
// The script answers three questions and prints PASS/FAIL for each:
//   Q1  Does ChromeDriver attach at all?
//   Q2  Does BiDi negotiate (capabilities.webSocketUrl present)?
//   Q3  Is the embedded http(s) target reachable as a window handle?
//   Q4  Does driver.get() on the attached handle drive the existing browser?
//   Q5  Does a second tool call on the same driver session work without re-clobbering?

import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

const ADDR = process.env.ATTACH_ADDR || '127.0.0.1:9222';
const WANT_URL = process.env.TARGET_URL || '';

function line() { console.log('-'.repeat(72)); }
function ok(msg)   { console.log(`PASS  ${msg}`); }
function bad(msg)  { console.log(`FAIL  ${msg}`); }
function info(msg) { console.log(`      ${msg}`); }

async function preflight() {
  line();
  console.log(`Preflight: GET http://${ADDR}/json/version`);
  let ver;
  try {
    const res = await fetch(`http://${ADDR}/json/version`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    ver = await res.json();
  } catch (err) {
    bad(`cannot reach CDP endpoint at ${ADDR} — ${err.message}`);
    info('start Chrome with: chrome.exe --remote-debugging-port=9222 <your-url>');
    process.exit(1);
  }
  ok(`CDP endpoint reachable`);
  info(`Browser:        ${ver.Browser}`);
  info(`Protocol:       ${ver['Protocol-Version']}`);
  info(`V8:             ${ver['V8-Version']}`);
  info(`User-Agent:     ${ver['User-Agent']}`);

  const targets = await (await fetch(`http://${ADDR}/json`)).json();
  console.log(`\nTargets at ${ADDR}/json (${targets.length}):`);
  for (const t of targets) {
    info(`[${t.type.padEnd(8)}] ${t.url}`);
  }
  return { ver, targets };
}

async function attach() {
  line();
  console.log('Attempting WebDriver attach with BiDi requested…');

  const builder = new Builder()
    .forBrowser('chrome')
    .withCapabilities({
      browserName: 'chrome',
      webSocketUrl: true,  // ask chromedriver to host BiDi mapper
      'goog:chromeOptions': {
        debuggerAddress: ADDR,
        windowTypes: ['page', 'webview'],
      },
    });

  if (process.env.SELENIUM_CHROMEDRIVER) {
    info(`Using pinned chromedriver: ${process.env.SELENIUM_CHROMEDRIVER}`);
    builder.setChromeService(new chrome.ServiceBuilder(process.env.SELENIUM_CHROMEDRIVER));
  } else {
    info('Using selenium-manager auto-detected chromedriver');
  }

  let driver;
  try {
    driver = await builder.build();
  } catch (err) {
    bad(`driver.build() threw — ${err.message}`);
    info('Common causes: chromedriver major != Chrome major, or chromedriver too old to attach.');
    process.exit(2);
  }
  ok('Q1  ChromeDriver attached');

  const caps = await driver.getCapabilities();
  const wsUrl = caps.get('webSocketUrl');
  if (wsUrl) {
    ok(`Q2  BiDi negotiated — webSocketUrl: ${wsUrl}`);
  } else {
    bad('Q2  BiDi did NOT negotiate — caps.webSocketUrl is empty');
    info('     => stealth preload + BiDi event collector will not work in attach mode');
    info('     => fall back to raw CDP for those features');
  }

  const browserVer = caps.get('browserVersion');
  const driverVer  = caps.get('chrome')?.chromedriverVersion;
  info(`Browser version cap:    ${browserVer}`);
  info(`Chromedriver version:   ${driverVer}`);

  return driver;
}

async function inspectHandles(driver) {
  line();
  console.log('Enumerating window handles…');
  const handles = await driver.getAllWindowHandles();
  info(`getAllWindowHandles → ${handles.length} handle(s)`);

  let matched = null;
  for (const h of handles) {
    await driver.switchTo().window(h);
    const url = await driver.getCurrentUrl();
    const title = await driver.getTitle();
    info(`[${h}] ${title || '(no title)'} :: ${url}`);
    if (WANT_URL && url.includes(WANT_URL) && !matched) matched = { h, url };
  }

  if (WANT_URL) {
    if (matched) {
      ok(`Q3  matched handle for TARGET_URL=${WANT_URL} → ${matched.url}`);
      await driver.switchTo().window(matched.h);
    } else {
      bad(`Q3  no handle URL matches TARGET_URL=${WANT_URL}`);
      info('     => windowTypes did not surface the webview, or the app is not loaded yet');
      info('     => fall back: switch the surface to WebContentsView, or use raw CDP');
    }
  } else {
    info('TARGET_URL not set — skipping Q3 match. Set TARGET_URL=<substring> to verify.');
  }
}

async function listTargets() {
  const list = await (await fetch(`http://${ADDR}/json`)).json();
  return list.map(t => ({ type: t.type, url: t.url, id: t.id, title: t.title }));
}

function summarizeTargets(list) {
  const counts = {};
  for (const t of list) counts[t.type] = (counts[t.type] || 0) + 1;
  const pages = list.filter(t => t.type === 'page' || t.type === 'webview');
  return { counts, pages };
}

async function driveAttachedHandle(driver) {
  line();
  console.log('Q4 — calling driver.get() on the attached handle…');
  const probeUrl = 'https://example.com/?probe=attach-test';

  const before = await listTargets();
  const beforeSummary = summarizeTargets(before);
  info(`Before: target type counts ${JSON.stringify(beforeSummary.counts)}`);
  info(`Before: ${beforeSummary.pages.length} page/webview target(s):`);
  for (const t of beforeSummary.pages) info(`    [${t.type}] ${t.url}`);

  let beforeUrl = '(unknown)';
  try { beforeUrl = await driver.getCurrentUrl(); } catch {}
  info(`Before: attached handle current URL: ${beforeUrl}`);

  let getThrew = null;
  try {
    await driver.get(probeUrl);
  } catch (err) {
    getThrew = err.message;
  }

  if (getThrew) {
    bad(`Q4  driver.get() threw — ${getThrew}`);
  } else {
    ok('Q4a driver.get() returned without error');
  }

  let afterUrl = '(unknown)';
  try { afterUrl = await driver.getCurrentUrl(); } catch {}
  info(`After:  attached handle current URL: ${afterUrl}`);

  const after = await listTargets();
  const afterSummary = summarizeTargets(after);
  info(`After:  target type counts ${JSON.stringify(afterSummary.counts)}`);
  info(`After:  ${afterSummary.pages.length} page/webview target(s):`);
  for (const t of afterSummary.pages) info(`    [${t.type}] ${t.url}`);

  // Decide what actually happened
  const beforePageCount = beforeSummary.pages.length;
  const afterPageCount = afterSummary.pages.length;
  const existingTabUrl = beforeSummary.pages.find(t => !t.url.startsWith('about:'))?.url;
  const existingTabAfter = afterSummary.pages.find(t => t.url === existingTabUrl)?.url;

  if (afterPageCount > beforePageCount) {
    bad('Q4b a NEW page target appeared — driver.get() spawned a tab, did not drive the existing one');
  } else if (existingTabUrl && !existingTabAfter && afterSummary.pages.some(t => t.url.includes('probe=attach-test'))) {
    ok('Q4b the existing page target was navigated to the probe URL — driver.get() DROVE the existing window');
  } else if (afterSummary.pages.some(t => t.url.includes('probe=attach-test'))) {
    ok('Q4b a target now holds the probe URL — likely the previously-about:blank handle was navigated');
    info('     (existing http(s) tab appears unchanged — chromedriver drove its own handle, not the original tab)');
  } else {
    bad('Q4b no target shows the probe URL after driver.get() — unexpected, inspect /json output above');
  }
}

async function secondToolCall(driver) {
  line();
  console.log('Q5 — same driver, second tool call (no rebuild)…');
  const probeUrl2 = 'https://example.com/?probe=second-call';

  // Capture state right BEFORE the second tool call.
  // If the session were re-bootstrapping for any reason, we'd see about:blank here.
  let preUrl = '(unknown)';
  try { preUrl = await driver.getCurrentUrl(); } catch {}
  const preTargets = await listTargets();
  const preHandle = await driver.getWindowHandle();
  info(`Pre:  current URL    = ${preUrl}`);
  info(`Pre:  active handle  = ${preHandle}`);
  info(`Pre:  page targets   = ${summarizeTargets(preTargets).pages.length}`);

  if (preUrl === 'about:blank') {
    bad('Q5a session reverted to about:blank between tool calls — re-clobber detected');
  } else {
    ok('Q5a session retained its URL between tool calls — no re-clobber');
  }

  // Do a real second action: navigate, read title, take a snapshot-equivalent.
  await driver.get(probeUrl2);
  const postUrl = await driver.getCurrentUrl();
  const postTitle = await driver.getTitle();
  const postHandle = await driver.getWindowHandle();
  const postTargets = await listTargets();
  info(`Post: current URL    = ${postUrl}`);
  info(`Post: title          = ${postTitle}`);
  info(`Post: active handle  = ${postHandle}`);
  info(`Post: page targets   = ${summarizeTargets(postTargets).pages.length}`);

  if (postHandle !== preHandle) {
    bad(`Q5b active handle changed (${preHandle} → ${postHandle}) — second call moved windows`);
  } else {
    ok('Q5b active handle stable across calls');
  }

  if (postUrl.includes('probe=second-call')) {
    ok('Q5c second navigation succeeded on the same target');
  } else {
    bad(`Q5c expected probe=second-call in URL, got ${postUrl}`);
  }

  if (summarizeTargets(postTargets).pages.length === summarizeTargets(preTargets).pages.length) {
    ok('Q5d page-target count unchanged — no new window/tab spawned');
  } else {
    bad('Q5d page-target count changed — a new window/tab appeared');
  }
}

async function main() {
  const { ver } = await preflight();
  const driver = await attach();
  try {
    await inspectHandles(driver);
    await driveAttachedHandle(driver);
    await secondToolCall(driver);
  } finally {
    line();
    console.log('Releasing WebDriver reference WITHOUT driver.quit() (attach-mode rule).');
    // Intentionally do NOT call driver.quit() — that would close the attached browser.
    // Dropping the reference is the only safe teardown.
  }
  line();
  console.log('Done. Summary printed above.');
  console.log(`Chromium major: ${ver.Browser?.match(/Chrome\/(\d+)/)?.[1] ?? '?'} — pin chromedriver to this major.`);
  process.exit(0);
}

main().catch(err => {
  bad(`unhandled error: ${err.message}`);
  console.error(err);
  process.exit(99);
});
