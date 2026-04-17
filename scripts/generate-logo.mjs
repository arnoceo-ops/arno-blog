import puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: transparent;
      display: inline-block;
      padding: 0;
    }
    .logo {
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 900;
      font-size: 108px;
      line-height: 1;
      letter-spacing: -1px;
      white-space: nowrap;
    }
    .arno { color: #333333; }
    .bot  { color: #EE7700; }
  </style>
</head>
<body>
  <div class="logo"><span class="arno">ARNO</span><span class="bot">BOT</span></div>
</body>
</html>`;

const browser = await puppeteer.launch();
const page = await browser.newPage();

await page.setContent(html, { waitUntil: 'load', timeout: 60000 });
await new Promise(r => setTimeout(r, 3000));

const element = await page.$('.logo');
const clip = await element.boundingBox();

await page.setViewport({
  width: Math.ceil(clip.width) + 20,
  height: Math.ceil(clip.height) + 20,
  deviceScaleFactor: 3,
});

await page.setContent(html, { waitUntil: 'load', timeout: 60000 });
await new Promise(r => setTimeout(r, 3000));

const el = await page.$('.logo');
const screenshot = await el.screenshot({ omitBackground: true });

const outPath = join(__dirname, '..', 'public', 'arnobot-logo.png');
writeFileSync(outPath, screenshot);
console.log('Logo opgeslagen:', outPath);

await browser.close();
