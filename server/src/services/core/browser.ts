import puppeteer, { Browser, Page } from 'puppeteer';
import extract from 'extract-zip';
import { join } from 'node:path';
import { writeFile,  readFile, rm, unlink, } from 'node:fs/promises';
import { existsSync, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { logger } from './logger';
import { HEADLESS_MODE,PTR_EXEC_DIR,PTR_SESSION_DIR, PTR_SESSION_URL, UPLOADS_DIR } from './config';
import { downloadFile } from '@/utils/download';
import { Readable } from 'node:stream';

let browser: Browser | null = null;
let page: Page | null = null;

/**
 *
 */
export const getBrowser = async (): Promise<Browser> => {
  if (!browser || !browser.connected) {
    const log = logger.child({ msgPrefix: '[Browser]' });

    if (PTR_SESSION_URL) {
      log.browser('Setting up session from URL...');
      await extractSessionFromUrl(PTR_SESSION_URL);
    }

    log.browser('Launch browser instance...');
    browser = await puppeteer.launch({
      headless: HEADLESS_MODE,
      userDataDir: PTR_SESSION_DIR,
      executablePath: PTR_EXEC_DIR,
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


const LOCK_FILE = join(PTR_SESSION_DIR, '.puppeteer-session.lock');
/**
 * Remember download session
 */
const saveLockedUrl = async (url: string) => writeFile(LOCK_FILE, url, 'utf-8');
const getLockedUrl = async () => {
  try {
    if (existsSync(LOCK_FILE)) {
      const content = await readFile(LOCK_FILE, 'utf-8');
      return content.trim();
    }
  } catch {}
  return null;
};

/**
 * Setup a custom browser session
 */
export const extractSessionFromUrl = async (sessionUrl: string) => {
  const lockedUrl = await getLockedUrl();
  if (lockedUrl === sessionUrl) return;

  const tempZipPath = join(UPLOADS_DIR, `session-${Date.now()}.zip`);
  await rm(PTR_SESSION_DIR, { recursive: true, force: true });
  await downloadFile(sessionUrl, tempZipPath);

  await extract(tempZipPath, { dir: PTR_SESSION_DIR });

  await unlink(tempZipPath);
  await saveLockedUrl(sessionUrl);
}

/**
 *
 */
export const extractSessionFromStream = async <Z extends Readable>(zipStream: Z) => {
  await rm(PTR_SESSION_DIR, { recursive: true, force: true });
  const tempZipPath = join(UPLOADS_DIR, `session-${Date.now()}.zip`);
  await pipeline(zipStream, createWriteStream(tempZipPath));

  await extract(tempZipPath, { dir: PTR_SESSION_DIR });

  await unlink(tempZipPath);
  await saveLockedUrl('non-url:uploaded-session');
}
