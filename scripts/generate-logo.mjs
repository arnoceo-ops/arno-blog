import puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function generateLogo(page, text, outFile) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: transparent; display: inline-block; }
    .logo {
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 900;
      font-size: 300px;
      line-height: 1;
      letter-spacing: -2px;
      white-space: nowrap;
    }
    .dark   { color: #333333; }
    .orange { color: #EE7700; }
  </style>
</head>
<body>
  <div class="logo">${text}</div>
</body>
</html>`;

  await page.setViewport({ width: 3000, height: 400, deviceScaleFactor: 4 });
  await page.setContent(html, { waitUntil: 'load', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3000));

  const el = await page.$('.logo');
  const screenshot = await el.screenshot({ omitBackground: true });

  const outPath = join(__dirname, '..', 'public', outFile);
  writeFileSync(outPath, screenshot);
  console.log('Logo opgeslagen:', outPath);
}

const browser = await puppeteer.launch();
const page = await browser.newPage();

await generateLogo(
  page,
  '<span class="dark">ARNO</span><span class="orange">BOT</span>',
  'arnobot-logo.png'
);

await generateLogo(
  page,
  '<span class="orange">SALES</span><span class="dark">CANVAS</span>',
  'salescanvas-logo.png'
);

await browser.close();
