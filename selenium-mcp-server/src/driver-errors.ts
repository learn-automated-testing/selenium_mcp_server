import { platform } from 'node:os';

export type ErrorCategory =
  | 'NETWORK_UNREACHABLE'
  | 'VERSION_MISMATCH'
  | 'CACHE_PERMISSION'
  | 'DOWNLOAD_FAILED'
  | 'UNKNOWN';

type DriverContext = 'local' | 'grid';

const CATEGORY_PATTERNS: Array<{ category: ErrorCategory; patterns: RegExp[] }> = [
  {
    category: 'NETWORK_UNREACHABLE',
    patterns: [
      /no route to host/i,
      /tcp connect error/i,
      /network is unreachable/i,
      /dns error/i,
      /ENOTFOUND/,
      /ECONNREFUSED/,
    ],
  },
  {
    category: 'VERSION_MISMATCH',
    patterns: [
      /only supports Chrome version/i,
      /chrome version.*binary path/i,
    ],
  },
  {
    category: 'CACHE_PERMISSION',
    patterns: [
      /Permission denied.*\.cache\/selenium/i,
      /EACCES/,
    ],
  },
  {
    category: 'DOWNLOAD_FAILED',
    patterns: [
      /error sending request for url/i,
      /download failed/i,
      /unable to download/i,
    ],
  },
];

export function classifyDriverError(errorText: string): ErrorCategory {
  for (const { category, patterns } of CATEGORY_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(errorText)) {
        return category;
      }
    }
  }
  return 'UNKNOWN';
}

export function getDiagnosticCommand(): string {
  const plat = platform();
  switch (plat) {
    case 'darwin':
      return './node_modules/selenium-webdriver/bin/macos/selenium-manager --browser chrome --debug';
    case 'win32':
      return '.\\node_modules\\selenium-webdriver\\bin\\windows\\selenium-manager.exe --browser chrome --debug';
    default:
      return './node_modules/selenium-webdriver/bin/linux/selenium-manager --browser chrome --debug';
  }
}

const REMEDIATION: Record<ErrorCategory, (original: string) => string> = {
  NETWORK_UNREACHABLE: () => [
    'Selenium Manager could not reach the Chrome-for-Testing',
    'endpoints.',
    '',
    'Required outbound access:',
    '  - https://googlechromelabs.github.io  (version manifest)',
    '  - https://storage.googleapis.com      (driver download)',
    '',
    'Likely causes:',
    '  - VPN or corporate firewall blocking one of the hosts',
    '  - DNS resolution issues',
    '  - IPv6/IPv4 routing mismatch (errno 65 = ENETUNREACH)',
  ].join('\n'),

  VERSION_MISMATCH: (original: string) => {
    const match = original.match(
      /only supports Chrome version (\d+).*?(?:Current browser version is|current browser version) ([\d.]+)/is,
    );
    const driverVer = match?.[1] ?? 'unknown';
    const browserVer = match?.[2] ?? 'unknown';
    return [
      `ChromeDriver supports Chrome ${driverVer}, but the`,
      `installed Chrome is ${browserVer}.`,
      '',
      'Fix:',
      '  1. npm update selenium-webdriver',
      '  2. rm -rf ~/.cache/selenium/',
      '  3. Restart the server',
      '',
      'Alternatively, download a compatible chromedriver and set:',
      '  CHROMEDRIVER_PATH=/path/to/chromedriver',
    ].join('\n');
  },

  CACHE_PERMISSION: () => [
    'Selenium Manager cannot write to the driver cache.',
    '',
    'Fix:',
    '  - Linux/macOS: chmod -R u+rwX ~/.cache/selenium/',
    '  - Windows: check permissions on %LOCALAPPDATA%\\selenium\\',
    '  - Or delete the cache and let it be recreated:',
    '    rm -rf ~/.cache/selenium/',
  ].join('\n'),

  DOWNLOAD_FAILED: () => [
    'Selenium Manager started the download but it failed.',
    '',
    'Required outbound access:',
    '  - https://googlechromelabs.github.io  (version manifest)',
    '  - https://storage.googleapis.com      (driver download)',
    '',
    'Likely causes:',
    '  - Intermittent network failure — retry may help',
    '  - Proxy not configured for HTTPS traffic',
    '  - Partial download in cache — clear with:',
    '    rm -rf ~/.cache/selenium/',
  ].join('\n'),

  UNKNOWN: () => [
    'The root cause could not be determined automatically.',
    '',
    'Run the diagnostic command below for detailed output,',
    'then check the Selenium Manager documentation.',
  ].join('\n'),
};

export function buildDriverErrorMessage(
  category: ErrorCategory,
  originalErr: Error,
  context: DriverContext = 'local',
): string {
  const target = context === 'grid'
    ? 'Selenium Grid session creation failed.'
    : 'Selenium browser-driver acquisition failed.';
  const remediation = REMEDIATION[category](originalErr.message);
  const diagnostic = getDiagnosticCommand();

  const sections = [
    `[X] ${target}`,
    '',
    `Cause: ${category}`,
    remediation,
  ];

  if (context === 'grid') {
    sections.push(
      '',
      'Grid diagnostics:',
      '  - Verify Grid URL is reachable',
      '  - Check node status via /status endpoint',
      '  - Ensure the requested browser is available',
    );
  }

  sections.push(
    '',
    'To diagnose, run from the project directory:',
    `  ${diagnostic}`,
    '',
    'Original error:',
    `  ${originalErr.message}`,
  );

  return sections.join('\n');
}

export function wrapDriverError(originalErr: unknown, context: DriverContext = 'local'): Error {
  if (!(originalErr instanceof Error)) {
    return new Error(String(originalErr));
  }

  const text = originalErr.message;
  const isDriverError =
    /unable to obtain browser driver/i.test(text) ||
    /only supports Chrome version/i.test(text) ||
    /session not created/i.test(text);

  if (!isDriverError) {
    return originalErr;
  }

  const category = classifyDriverError(text);
  const message = buildDriverErrorMessage(category, originalErr, context);

  const wrapped = new Error(message);
  wrapped.cause = originalErr;
  return wrapped;
}
