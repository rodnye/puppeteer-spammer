import { logger } from '@/services/core/logger';
import { older_getPage } from '@/services/core/browser';
import { FbCommentDto, FbPostDto } from '../dto';
import { goToPost } from '../navigation';
import { matchComment } from '../utils';
import { parseDto } from '@/utils/parse-dto';

export const getCommentsFromFb = async (post: FbPostDto) => {
  const log = logger.child({ msgPrefix: '[FB] [GET COMMENTS]' });
  const page = await older_getPage();

  const fullUrl = await goToPost(post.url);
  log.info('Post: ' + fullUrl);

  try {
    log.browser('Checking for "No comments" message');
    await page.locator('::-p-text("Aún no hay comentarios")').wait();
    log.info('No comments found');
    return [];
  } catch {
    log.info('Comments found, proceeding with extraction');
  }

  log.browser('Clicking on "Most relevant" dropdown');
  await page
    .locator('div[aria-haspopup="menu"]::-p-text("Más pertinentes")')
    .click();

  log.browser('Selecting "Most recent" option');
  await page.locator('div[role="menuitem"]::-p-text("Más recientes")').click();

  const comments: FbCommentDto[] = [];
  const commentElements = await page.$$(
    'div[role="dialog"] div[role="article"]'
  );

  log.info(`Found ${commentElements.length} comment elements to process`);

  for (const [index, commentDiv] of commentElements.entries()) {
    try {
      log.debug(`Processing comment ${index + 1}/${commentElements.length}`);
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
        postId: post.postId,
        ...partialComment,
      });

      comments.push(comment);
      log.debug(`Successfully processed comment ${index + 1}`);
    } catch (error) {
      if (error instanceof Error) {
        const previewText = await commentDiv.evaluate(
          (d) => d.textContent?.substring(0, 20) || 'No text content'
        );

        log.error(
          {
            previewText,
          },
          `Error processing comment ${index + 1}: ${error.message}`
        );
      }
      throw error;
    }
  }

  log.info(`Successfully extracted ${comments.length} comments`);
  return comments;
};
