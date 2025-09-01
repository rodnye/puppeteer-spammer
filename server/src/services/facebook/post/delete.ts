import { getPage } from '@/services/core/browser';
import { goToPost, url2FbPost } from '../navigation';
import { FbPostDto } from '../dto';

export const deletePost = async (post: string | FbPostDto) => {
  const page = await getPage();

  post = typeof post === 'string' ? await url2FbPost(post) : post;
  const fullUrl = await goToPost(post);

  const popupButton = page.locator(
    'div[role="dialog"] div[aria-label="Acciones para esta publicación"]'
  );
  await popupButton.click();

  const deleteButton = page.locator('div::-p-text("Eliminar publicación")');

  await deleteButton.click();
  const confirmButton = page.locator(
    'div[role="button"][aria-label="Eliminar"]'
  );

  await confirmButton.click();

  await page.waitForFunction(
    () => !window.location.href.includes(fullUrl),
    { timeout: 300000 } // 5 minute timeout for manual verification
  );

  return post;
};
