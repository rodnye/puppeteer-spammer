import { getPage } from '@/services/core/browser';
import { goToPost } from '../navigation';
import { FbPostDto } from '../dto';

export const deletePostFromFb = async (groupId: string, postId: string) => {
  const page = await getPage();

  const fullUrl = await goToPost(FbPostDto.makeUrl(groupId, postId));

  // button to show menu options
  await page
    .locator(
      'div[role="dialog"] div[aria-label="Acciones para esta publicación"]'
    )
    .click();

  // launch delete action
  await page.locator('div::-p-text("Eliminar publicación")').click();

  // confirm the modal
  await page.locator('div[role="button"][aria-label="Eliminar"]').click();

  await new Promise((r) => setTimeout(r, 3000));
};
