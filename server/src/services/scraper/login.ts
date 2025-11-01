import type { Page } from 'puppeteer';
import { older_getPage } from '@/services/core/browser';
import { logger } from '@/services/core/logger';
import { FB_PASS, FB_USER, HEADLESS_MODE } from '@/services/core/config';

let facebookPageInstance: Page | null = null;

/**
 * Singleton on a logged-in Facebook page instance
 */
export const getFacebookLogin = async (): Promise<Page> => {
  const log = logger.child({ msgPrefix: '[FB Login]' });
  if (facebookPageInstance && !facebookPageInstance.isClosed()) {
    return facebookPageInstance;
  }

  const page = await older_getPage();

  log.browser('Navigating to FB login page');
  await page.goto('https://www.facebook.com/login', {
    waitUntil: 'networkidle2',
  });

  log.browser(`Current URL: ${page.url()}`);

  // check if login is required
  if (
    page.url().includes('login') ||
    page.url().includes('two_step_verification')
  ) {
    log.browser('Login required, starting authentication process');
    log.warn(
      'Este paso requiere intervención humana para completar el captcha de seguridad de Facebook.'
    );

    await page.bringToFront();

    await page.locator('#email').fill(FB_USER);
    await page.locator('#pass').fill(FB_PASS);

    if (HEADLESS_MODE) {
      const message =
        'Oh no!!, Facebook have a solid captcha verification, please disable HEADLESS_MODE=false for manual verification';
      log.fatal(message);
      throw new Error(message);
    }

    try {
      log.browser('Waiting for manual verification... (5 minute timeout)');
      await page.waitForFunction(
        () =>
          !window.location.href.includes('login') &&
          !window.location.href.includes('two_factor') &&
          !window.location.href.includes('auth') &&
          !window.location.href.includes('checkpoint'),
        { timeout: 300000 } // 5 minute timeout for manual verification
      );
    } catch (error) {
      log.fatal('Manual verification timeout exceeded');
      throw new Error('Manual verification timeout. Please try again.');
    }
  } else {
    log.browser('Already logged in, skipping authentication');
  }

  log.browser('Done.');
  facebookPageInstance = page;
  return page;
};
