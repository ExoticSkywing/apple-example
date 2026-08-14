import { chromium, firefox, type Browser } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import * as path from 'node:path';

const base = process.env.QA_URL ?? 'http://127.0.0.1:4173';
const out = path.resolve('RECON/screenshots');
await mkdir(out, { recursive: true });
const failures: string[] = [];
const results: unknown[] = [];

async function run(name: string, browser: Browser, width: number, height: number) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedRequests: string[] = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => pageErrors.push(e.message));
  page.on('requestfailed', r => failedRequests.push(r.url()));
  const response = await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForSelector('.product-viewer.is-expanded');
  const expanded = await page.locator('[data-open]').getAttribute('aria-expanded');
  await page.locator('[data-close]').click();
  const collapsed = await page.locator('[data-open]').getAttribute('aria-expanded');
  await page.locator('[data-open]').click();
  const reopened = await page.locator('[data-open]').getAttribute('aria-expanded');
  const canvas = await page.locator('canvas').count();
  const video = await page.locator('video').count();
  const media = await page.locator('.product-media').boundingBox();
  const card = await page.locator('.tour-card').boundingBox();
  const close = await page.locator('.close-button').boundingBox();
  await page.screenshot({ path: path.join(out, `cn-action-${name}-${width}x${height}.png`), fullPage: true });
  const boxes = [media, card, close];
  const boxFailure = boxes.some(b => !b || b.x < -1 || b.y < -1 || b.x + b.width > width + 1 || b.y + b.height > height + 1800);
  if (response?.status() !== 200 || expanded !== 'true' || collapsed !== 'false' || reopened !== 'true' || canvas || video || boxFailure || consoleErrors.length || pageErrors.length || failedRequests.length) failures.push(`${name}-${width}x${height}`);
  results.push({ name, viewport: `${width}x${height}`, expanded, collapsed, reopened, canvas, video, media, card, close, consoleErrors, pageErrors, failedRequests });
  await context.close();
}

for (const [name, launcher] of [['chromium', chromium], ['firefox', firefox]] as const) {
  const browser = await launcher.launch({ headless: true });
  for (const [width, height] of [[390, 844], [768, 900], [1440, 1000]] as const) await run(name, browser, width, height);
  await browser.close();
}
console.log(JSON.stringify({ base, results, failures }, null, 2));
if (failures.length) process.exitCode = 1;
