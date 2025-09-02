import puppeteer, { Browser, Page } from 'puppeteer';
import { HEADLESS_MODE, PTR_SESSION_DIR } from './config';
import { logger } from './logger';

let browser: Browser | null = null;
let page: Page | null = null;

/**
 *
 */
export const getBrowser = async (): Promise<Browser> => {
  if (!browser || !browser.connected) {
    const log = logger.child({ msgPrefix: '[Browser]' });

    log.browser('Launch browser instance...');
    browser = await puppeteer.launch({
      headless: HEADLESS_MODE,
      userDataDir: PTR_SESSION_DIR,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
      ],
      defaultViewport: {
        width: 1280,
        height: 600,
      },
    });

    log.browser('Done');
  }
  return browser;
};

/**
 *
 */
export const getPage = async () => {
  if (!page || page.isClosed()) {
    const log = logger.child({ msgPrefix: '[Page]' });
    const browser = await getBrowser();

    log.browser('Create new page...');
    page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    // hide webdriver
    await page.evaluateOnNewDocument(`
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      // Otras propiedades anti-bot
      window.chrome = { runtime: {} };
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'languages', { get: () => ['es-ES', 'es'] });
    `);
    log.browser('Done');
  }
  return page;
};

/**
 *
 */
export const closeBrowser = async () => {
  if (browser) {
    await browser.close();
    browser = null;
  }
};
