const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

(async () => {
  let browser;
  let server;

  try {
    // Start static server in background for capturing
    server = spawn('npx', ['http-server', '.', '-p', '8080']);

    // Fail fast if server fails to start
    server.on('error', (err) => {
      console.error('Failed to start http-server:', err);
      process.exit(1);
    });

    // Wait a brief moment for the server to bind
    await new Promise(resolve => setTimeout(resolve, 2000));

    browser = await chromium.launch();
    const page = await browser.newPage();
    page.setDefaultTimeout(15000); // Fail fast after 15 seconds if an operation hangs

    const response = await page.goto('http://localhost:8080/index.html');
    if (!response || !response.ok()) {
      throw new Error(`Failed to load index.html: ${response ? response.status() : 'Unknown error'}`);
    }

    const dir = './screenshots';
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }

    const prefix = new Date().toISOString().split('T')[0] + '_';
    const langs = ['fr', 'en', 'es', 'gr', 'pa', 'bn', 'ur', 'hi'];

    for (const lang of langs) {
        if (lang !== 'fr') {
          await page.evaluate(`switchLang('${lang}')`);
        } else {
          await page.evaluate(`switchLang('fr')`);
        }

        // Wait for fading animation to complete before capturing
        await page.waitForTimeout(500);

        const screenshotPath = path.join(dir, `${prefix}${lang}_verification.png`);
        await page.screenshot({ path: screenshotPath });
        console.log(`Captured ${screenshotPath}`);
    }
  } catch (error) {
    console.error('Error during capture:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
    if (server) {
      server.kill();
    }
    process.exit(0);
  }
})();
