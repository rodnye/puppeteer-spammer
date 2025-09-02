import { logger } from '@/services/core/logger';
import { getPage } from '@/services/core/browser';
import { goToPost } from '../navigation';
import { FbPostDto } from '../dto';

export const deletePostFromFb = async (groupId: string, postId: string) => {
  const log = logger.child({ msgPrefix: '[FB] [DELETE POST]' });
  const page = await getPage();

  const fullUrl = await goToPost(FbPostDto.makeUrl(groupId, postId));

  log.info('Post: ' + fullUrl);
  log.browser('Click on button to show menu options');
  await page
    .locator(
      'div[role="dialog"] div[aria-label="Acciones para esta publicación"]'
    )
    .click();

  log.browser('Click on delete');
  await page.locator('div::-p-text("Eliminar publicación")').click();
  
  // confirm the modal
  log.browser('Click on confirm delete');
  await page
    .locator(
      'div[role="dialog"][aria-label="¿Eliminar publicación definitivamente?"] div[role="button"][aria-label="Eliminar"]'
    )
    .click();

  await new Promise((r) => setTimeout(r, 3000));
  log.info('Done! ' + fullUrl);
};
