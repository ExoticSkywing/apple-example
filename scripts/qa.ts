import { chromium, firefox, type Browser, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const baseURL = process.env.QA_URL ?? 'http://127.0.0.1:4173';
const evidence = path.resolve('RECON/screenshots');
await mkdir(evidence, { recursive: true });

const failures: string[] = [];
const results: unknown[] = [];

const assert = (condition: boolean, message: string): void => {
  if (!condition) failures.push(message);
};

type PixelSamples = {
  screen: [number, number, number];
  island: [number, number, number];
};

const sampleVideoPixels = async (page: Page, currentTime: number): Promise<PixelSamples> => {
  return page.locator('[data-media]').evaluate(async (element: HTMLVideoElement, time) => {
    element.pause();
    element.currentTime = time;
    await new Promise<void>((resolve) => {
      element.addEventListener('seeked', () => resolve(), { once: true });
      window.setTimeout(resolve, 500);
    });
    const canvas = document.createElement('canvas');
    canvas.width = element.videoWidth;
    canvas.height = element.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Missing 2d context');
    context.drawImage(element, 0, 0);
    const screen = context.getImageData(600, 700, 1, 1).data;
    const island = context.getImageData(528, 190, 1, 1).data;
    return {
      screen: [screen[0], screen[1], screen[2]],
      island: [island[0], island[1], island[2]],
    };
  }, currentTime);
};

const exercise = async (browserName: string, browser: Browser, width: number, height: number): Promise<void> => {
  const context = await browser.newContext({
    viewport: { width, height },
    isMobile: width < 735,
    hasTouch: width < 735,
    deviceScaleFactor: width < 735 ? 2 : 1,
    reducedMotion: 'no-preference',
  });
  const page: Page = await context.newPage();
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on('console', (entry) => { if (entry.type() === 'error') consoleErrors.push(entry.text()); });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.locator('[data-media]').waitFor({ state: 'visible' });
  await page.waitForTimeout(800);

  const mediaInfo = await page.locator('[data-media]').evaluate((element: HTMLVideoElement) => ({
    readyState: element.readyState,
    duration: element.duration,
    videoWidth: element.videoWidth,
    videoHeight: element.videoHeight,
    currentTime: element.currentTime,
  }));

  const sampleTimes = [0.8, 2.4, 4.5];
  const pixelSamples = [];
  for (const time of sampleTimes) pixelSamples.push(await sampleVideoPixels(page, time));
  const distance = (a: [number, number, number], b: [number, number, number]): number =>
    Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  assert(distance(pixelSamples[0].screen, pixelSamples[1].screen) > 8, `${browserName} ${width}x${height}: first wallpaper transition missing`);
  assert(distance(pixelSamples[1].screen, pixelSamples[2].screen) > 8, `${browserName} ${width}x${height}: second wallpaper transition missing`);
  assert(distance(pixelSamples[0].island, pixelSamples[1].island) < 5, `${browserName} ${width}x${height}: island changed during wallpaper switch`);
  assert(distance(pixelSamples[1].island, pixelSamples[2].island) < 5, `${browserName} ${width}x${height}: island changed during wallpaper switch`);

  await page.locator('[data-replay]').last().click();
  await page.waitForTimeout(900);
  const afterReplay = await page.locator('[data-media]').evaluate((element: HTMLVideoElement) => ({
    currentTime: element.currentTime,
    paused: element.paused,
  }));

  await page.locator('[data-close]').click();
  assert(await page.locator('[data-viewer]').evaluate((el) => el.classList.contains('is-collapsed')), `${browserName} ${width}x${height}: close failed`);
  await page.locator('[data-open]').click();
  await page.waitForTimeout(350);
  assert(!await page.locator('[data-viewer]').evaluate((el) => el.classList.contains('is-collapsed')), `${browserName} ${width}x${height}: reopen failed`);

  await page.locator('[data-media]').evaluate((element: HTMLVideoElement) => {
    element.pause();
    element.currentTime = Math.min(4.8, element.duration || 4.8);
  });
  await page.waitForFunction(() => {
    const element = document.querySelector<HTMLVideoElement>('[data-media]');
    return Boolean(element && element.currentTime >= 4.7);
  });
  await page.waitForTimeout(150);

  const boxes = await page.evaluate(() => {
    const selectors = ['.study-module', '[data-media]', '.feature-card', '.deck-arrow--prev svg', '.deck-arrow--next svg', '[data-close]'];
    const values = selectors.map((selector) => {
      const rect = document.querySelector(selector)?.getBoundingClientRect();
      return rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom } : null;
    });
    return {
      module: values[0],
      media: values[1],
      card: values[2],
      prev: values[3],
      next: values[4],
      close: values[5],
    };
  });

  assert(mediaInfo.duration === 5, `${browserName} ${width}x${height}: unexpected media duration ${mediaInfo.duration}`);
  assert(mediaInfo.videoWidth === 880 && mediaInfo.videoHeight === 768, `${browserName} ${width}x${height}: wrong video dimensions`);
  assert(afterReplay.currentTime > 0.1, `${browserName} ${width}x${height}: media did not advance after replay`);
  assert(boxes.media?.width === 733.328125 || Math.abs((boxes.media?.width ?? 0) - 733.333) < 0.1, `${browserName} ${width}x${height}: media CSS width drifted`);
  assert(boxes.card?.width === 316 || width < 390, `${browserName} ${width}x${height}: card width drifted`);
  for (const [name, box] of Object.entries({ card: boxes.card, prev: boxes.prev, next: boxes.next, close: boxes.close })) {
    if (!box) {
      failures.push(`${browserName} ${width}x${height}: missing ${name}`);
      continue;
    }
    assert(box.x >= 0 && box.y >= 0 && box.right <= width && box.bottom <= height, `${browserName} ${width}x${height}: ${name} outside viewport`);
  }

  const file = path.join(evidence, `clone-v3-official-media-${browserName}-${width}x${height}.png`);
  await page.screenshot({ path: file, fullPage: false });
  results.push({ browser: browserName, viewport: `${width}x${height}`, consoleErrors, pageErrors, mediaInfo, pixelSamples, afterReplay, boxes, screenshot: file });
  assert(consoleErrors.length === 0, `${browserName} ${width}x${height}: console errors ${consoleErrors.join(' | ')}`);
  assert(pageErrors.length === 0, `${browserName} ${width}x${height}: page errors ${pageErrors.join(' | ')}`);
  await context.close();
};

for (const [browserName, launcher] of [['chromium', chromium], ['firefox', firefox]] as const) {
  const browser = await launcher.launch({ headless: true });
  for (const [width, height] of [[390, 844], [390, 720], [1366, 768]] as const) {
    await exercise(browserName, browser, width, height);
  }
  await browser.close();
}

console.log(JSON.stringify({ baseURL, results, failures }, null, 2));
if (failures.length) process.exitCode = 1;
