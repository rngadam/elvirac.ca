const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Start static server in background for capturing if not already running
  const server = require('child_process').spawn('npx', ['http-server', '.', '-p', '8080']);
  await new Promise(resolve => setTimeout(resolve, 2000));

  await page.goto('http://localhost:8080/index.html');

  const dir = './screenshots';
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }

  const prefix = new Date().toISOString().split('T')[0] + '_';
  const langs = ['fr', 'en', 'es', 'gr', 'pa', 'bn', 'ur', 'hi'];

  for (const lang of langs) {
      if (lang !== 'fr') await page.evaluate(`switchLang('${lang}')`);
      else await page.evaluate(`switchLang('fr')`);
      await page.waitForTimeout(500); // wait for animation
      await page.screenshot({ path: path.join(dir, prefix + lang + '_verification.png') });
      console.log(`Captured ${prefix}${lang}_verification.png`);
  }

  await browser.close();
  server.kill();
})();
