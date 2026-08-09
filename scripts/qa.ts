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
  mode: string | null;
  card: { x: number; y: number; width: number; height: number } | null;
  actionKey: { x: number; y: number; width: number; height: number } | null;
  screenshot: string;
}

const results: Result[] = [];

const exercise = async (browser: Browser, browserName: string, width: number, height: number): Promise<void> => {
  const page: Page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, hasTouch: width < 735 });
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.locator('[data-viewer]').waitFor({ state: 'visible' });
  await page.waitForTimeout(3100);

  const card = await page.locator('[data-card]').boundingBox();
  const actionKey = await page.locator('[data-action-key]').boundingBox();
  if (!card || !actionKey) throw new Error(`${browserName} ${width}x${height}: viewer targets missing`);
  if (card.x < 0 || card.x + card.width > width) throw new Error(`${browserName} ${width}x${height}: expanded card outside viewport`);
  if (actionKey.x < 0 || actionKey.y < 0 || actionKey.x + actionKey.width > width || actionKey.y + actionKey.height > height) {
    throw new Error(`${browserName} ${width}x${height}: Action button outside viewport`);
  }

  await page.locator('[data-next]').click();
  await page.locator('[data-prev]').click();
  await page.locator('[data-close]').click();
  await page.locator('[data-open]').click();
  await page.waitForTimeout(2500);

  const fileName = `clone-v2-${browserName}-${width}x${height}-action.png`;
  const screenshot = path.join(outDir, fileName);
  await page.screenshot({ path: screenshot });
  results.push({
    browser: browserName,
    viewport: `${width}x${height}`,
    consoleErrors,
    pageErrors,
    mode: await page.locator('[data-page]').getAttribute('data-mode'),
    card,
    actionKey,
    screenshot,
  });
  await page.close();
};

for (const [browserName, launcher] of [['chromium', chromium], ['firefox', firefox]] as const) {
  const browser = await launcher.launch({ headless: true });
  try {
    await exercise(browser, browserName, 390, 844);
    await exercise(browser, browserName, 390, 720);
    await exercise(browser, browserName, 1366, 768);
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
