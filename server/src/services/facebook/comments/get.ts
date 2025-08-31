import { getPage } from '@/services/core/browser';
import { FbCommentDto, FbPostDto } from '../dto';
import { goToPost } from '../navigation';
import { matchComment } from '../utils';
import { parseDto } from '@/utils/parse-dto';

export const getCommentsFromFb = async (post: FbPostDto) => {
  const page = await getPage();

  await goToPost(post.url);

  try {
    await page.locator('::-p-text("Aún no hay comentarios")').wait();
    // si prosigue, no hay comentarios:
    return [];
  } catch {
    // si lanza error, es que si hay comentarios
    // continuar la inspeccion:
  }
  
  await page
    .locator('div[aria-haspopup="menu"]::-p-text("Más pertinentes")')
    .click();

  await page.locator('div[role="menuitem"]::-p-text("Más recientes")').click();

  const comments: FbCommentDto[] = [];
  for (const commentDiv of await page.$$(
    'div[role="dialog"] div[role="article"]'
  )) {
    try {
      const { unsafeId, ...partialComment } = await commentDiv.evaluate(
        (div) => {
          const box = div.children[1]; // the second div, the first is the image picture

          const authorBox = box.querySelector('span > span > span > a');
          if (!authorBox) throw new Error('Author box not found');

          const contentBox = box.querySelector(
            'div > div > div > span > div > div'
          );
          if (!contentBox) throw new Error('Content box not found');

          const dateBox = box.querySelector('ul > li > span > div > a');
          if (!dateBox) throw new Error('Date box not found');

          return {
            unsafeId: dateBox.getAttribute('href') || '',
            simpleDate: dateBox.textContent,
            authorId: authorBox.getAttribute('href') || undefined,
            author: authorBox.textContent,
            comment: contentBox.textContent,
          };
        }
      );

      const commentId = matchComment(unsafeId);
      if (!commentId) throw new Error('No match comment id on href date box');
      const comment = await parseDto(FbCommentDto, {
        id: commentId,
        groupId: post.groupId,
        postId: post.id,
        ...partialComment,
      });

      comments.push(comment);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Error on box $$${commentDiv.evaluate((d) =>
            d.textContent.substring(0, 20)
          )}$$\nDetails: ${error.message}`
        );
      }
      throw error;
    }
  }

  return comments;
};
