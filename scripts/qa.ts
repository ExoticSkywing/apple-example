import { chromium, firefox, type Browser, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const baseURL = process.env.QA_URL ?? 'http://127.0.0.1:4173';
const outDir = path.resolve('RECON/screenshots');
await mkdir(outDir, { recursive: true });

interface Result {
  browser: string;
  viewport: string;
  consoleErrors: string[];
  pageErrors: string[];
  selectedMode: string | null;
  activatedStatus: string | null;
  actionKey: { x: number; y: number; width: number; height: number } | null;
  screenshot: string;
}

const results: Result[] = [];

const exercise = async (browser: Browser, browserName: string, width: number, height: number): Promise<void> => {
  const page: Page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, hasTouch: width < 760 });
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.locator('[data-phone-wrap]').waitFor({ state: 'visible' });
  await page.locator('[data-mode="translate"]').click();
  await page.locator('[data-mode="recognize"]').click();

  const actionKey = await page.locator('[data-action-key]').boundingBox();
  if (!actionKey) throw new Error(`${browserName} ${width}x${height}: action key not visible`);

  await page.mouse.move(actionKey.x + actionKey.width / 2, actionKey.y + actionKey.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(820);
  await page.mouse.up();
  await page.locator('[data-status]').filter({ hasText: 'Listening for music' }).waitFor();

  const fileName = `clone-${browserName}-${width}x${height}-activated.png`;
  const screenshot = path.join(outDir, fileName);
  await page.screenshot({ path: screenshot, fullPage: true });

  results.push({
    browser: browserName,
    viewport: `${width}x${height}`,
    consoleErrors,
    pageErrors,
    selectedMode: await page.locator('.mode-button.is-selected').getAttribute('data-mode'),
    activatedStatus: await page.locator('[data-status]').textContent(),
    actionKey,
    screenshot,
  });

  await page.close();
};

for (const [browserName, launcher] of [['chromium', chromium], ['firefox', firefox]] as const) {
  const browser = await launcher.launch({ headless: true });
  try {
    await exercise(browser, browserName, 1366, 768);
    await exercise(browser, browserName, 390, 720);
    await exercise(browser, browserName, 390, 844);
  } finally {
    await browser.close();
  }
}

const failures = results.flatMap((result) => [
  ...result.consoleErrors.map((error) => `${result.browser} ${result.viewport} console: ${error}`),
  ...result.pageErrors.map((error) => `${result.browser} ${result.viewport} pageerror: ${error}`),
]);

console.log(JSON.stringify({ baseURL, results, failures }, null, 2));
if (failures.length > 0) process.exitCode = 1;
