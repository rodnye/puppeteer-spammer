import puppeteer, { Browser, Page } from 'puppeteer';

let browser: Browser | null = null;
let page: Page | null = null;

/**
 * 
 */
export const getBrowser = async (): Promise<Browser> => {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: false,
      userDataDir: './database/puppeteer-profile',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--window-size=1280,800',
      ],
      defaultViewport: {
        width: 1280,
        height: 600,
      },
    });
  }
  return browser;
};

/**
 * 
 */
export const getPage = async () => {
  if (!page) {
    const browser = await getBrowser();
    page = await browser.newPage();
    // User-Agent realista
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    // Ocultar webdriver
    await page.evaluateOnNewDocument(`
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      // Otras propiedades anti-bot
      window.chrome = { runtime: {} };
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'languages', { get: () => ['es-ES', 'es'] });
    `);
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
