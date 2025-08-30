import type { Page } from 'puppeteer';
import { getPage } from '@/services/core/browser';
import { FB_PASS, FB_USER } from '@/services/core/config';

let facebookPageInstance: Page | null = null;

/**
 * Singleton on a logged-in Facebook page instance
 */
export const getFacebookLogin = async (): Promise<Page> => {
  if (facebookPageInstance && !facebookPageInstance.isClosed()) {
    console.debug('[DEBUG] Using existing Facebook session');
    return facebookPageInstance;
  }

  const page = await getPage();

  console.debug('[DEBUG] Navigating to Facebook login page');
  await page.goto('https://www.facebook.com/login', {
    waitUntil: 'networkidle2',
  });

  console.debug(`[DEBUG] Current URL: ${page.url()}`);

  // check if login is required
  if (
    page.url().includes('login') ||
    page.url().includes('two_step_verification')
  ) {
    console.debug('[DEBUG] Login required, starting authentication process');
    console.log(
      'Este paso requiere intervención humana para completar el captcha de seguridad de Facebook.',
      'Esperando a que completes la verificación en dos pasos en el navegador...'
    );

    await page.bringToFront();
    (
      await page.waitForSelector('#email', { visible: true, timeout: 5000 })
    )?.type(FB_USER, {
      delay: 100,
    });
    (
      await page.waitForSelector('#pass', { visible: true, timeout: 5000 })
    )?.type(FB_PASS, {
      delay: 100,
    });

    try {
      console.debug(
        '[DEBUG] waiting for manual verification (5 minute timeout)'
      );
      await page.waitForFunction(
        () =>
          !window.location.href.includes('login') &&
          !window.location.href.includes('two_factor') &&
          !window.location.href.includes('checkpoint'),
        { timeout: 300000 } // 5 minute timeout for manual verification
      );
    } catch (error) {
      console.error('[DEBUG ERROR] Manual verification timeout exceeded');
      throw new Error('Manual verification timeout. Please try again.');
    }
  } else {
    console.debug('[DEBUG] Already logged in, skipping authentication');
  }

  console.debug(`[DEBUG] Login successful, final URL: ${page.url()}`);
  facebookPageInstance = page;
  return page;
};


