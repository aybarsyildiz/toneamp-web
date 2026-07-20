// Headless smoke test: boots a URL, fails on any console error, scrolls the
// whole page (driving the gain), toggles nothing destructive, screenshots.
// Usage: node scripts/verify.mjs http://localhost:4332
import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:4332';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000); // preloader

const height = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y <= height; y += 500) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(120);
}
await page.screenshot({ path: 'verify.png', fullPage: false });

await browser.close();
if (errors.length) {
  console.error('✗ console errors:\n' + errors.join('\n'));
  process.exit(1);
}
console.log('✓ no console errors, scrolled full page, screenshot → verify.png');
