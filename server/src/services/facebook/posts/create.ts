import { plainToInstance } from 'class-transformer';
import { getFacebookLogin } from '../login';
import { goToGroup } from '../navigation';
import { FbGroupDto, FbPostDto } from '../dto';
import { matchGroup, matchPost } from '../utils';

/**
 * The implemented process to publish in a group is:
 *
 * 1. Go to the group URL
 * 2. Click on the "Escribe algo..." button to open the post modal
 * 3. Type the message in the contenteditable div
 * 4. If there are files, upload them using the file input
 * 5. Click on the "Publicar" button to publish the post
 * 6. wait for a few seconds to ensure the post is published
 *
 * Note: selectors used in this function are based on the current Facebook HTML structure
 * and may change over time
 */
export const createPostFromFb = async (
  groupId: string,
  message: string,
  filePaths: string[] = []
): Promise<FbPostDto> => {
  console.debug(`[DEBUG] Starting post process for group: ${groupId}`);
  console.debug(`[DEBUG] |_____ Message length: ${message.length}`);
  console.debug(`[DEBUG] |_____ Files to upload: ${filePaths.length}`);

  const page = await getFacebookLogin();
  await goToGroup(FbGroupDto.makeUrl(groupId));

  // click on "Escribe algo..." button
  const buttonModal = page.locator(
    'div[class="x1i10hfl x1ejq31n x18oe1m7 x1sy0etr xstzfhl x972fbf x10w94by x1qhh985 x14e42zd x9f619 x1ypdohk x3ct3a4 xdj266r x14z9mp xat24cr x1lziwak x16tdsg8 x1hl2dhg xggy1nq x87ps6o x1lku1pv x1a2a7pz x6s0dn4 xmjcpbm x12ol6y4 x180vkcf x1khw62d x709u02 x78zum5 x1q0g3np x1iyjqo2 x1nhvcw1 x1n2onr6 xt7dq6l x1ba4aug x1y1aw1k xpdmqnj xwib8y2 x1g0dm76"]'
  );

  console.debug('[DEBUG] Clicking post creation button');
  await buttonModal.click();

  // wait for the modal to appear
  console.debug('[DEBUG] waiting for post modal to appear');
  await page.waitForSelector('[role=dialog] [contenteditable]', {
    visible: true,
    timeout: 10000,
  });

  console.debug('[DEBUG] Typing message content');
  await page.keyboard.type(message, {
    delay: 0,
  });

  // Handle file uploads if needed
  if (filePaths.length > 0) {
    console.debug('[DEBUG] Preparing to upload files');

    // wait for the file input
    const fileInput = await page.waitForSelector(
      '[role=dialog] input[type="file"]',
      { visible: true, timeout: 10000 }
    );

    if (!fileInput) {
      console.error('[DEBUG ERROR] File input not found');
      throw new Error('FATAL!: File input not found');
    }

    console.debug(`[DEBUG] Uploading ${filePaths.length} files`);
    await fileInput.uploadFile(...filePaths);

    // wait for files to upload
    console.debug('[DEBUG] waiting for files to upload');
    await new Promise((r) => setTimeout(r, 3000));
  }

  // Click on publish button
  console.debug('[DEBUG] Looking for publish button');
  const sendButton = page.locator('[role=dialog] [aria-label="Publicar"]');
  await sendButton.click();

  // wait for publish to complete
  console.debug(
    '[DEBUG] waiting for publication to complete and link appear (10 seconds)'
  );
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // get post URL
  console.debug('[DEBUG] Looking for post URL element');

  let postUrl: string | null = null;

  // try and try again
  while (!postUrl) {
    const postLinkElement = await page.waitForSelector(
      'div[class="html-div xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x6s0dn4 x17zd0t2 x78zum5 x1q0g3np x1a02dak"]' +
        ' ' +
        'a[class="x1i10hfl xjbqb8w x1ejq31n x18oe1m7 x1sy0etr xstzfhl x972fbf x10w94by x1qhh985 x14e42zd x9f619 x1ypdohk xt0psk2 x3ct3a4 xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz xkrqix3 x1sur9pj xi81zsa x1s688f"]',
      { timeout: 10000 }
    );
    if (!postLinkElement) {
      console.error('[DEBUG ERROR] Post link element not found');
      throw new Error('FATAL!: Post link element not found');
    }

    // the correct href only appear if the cursor is hover the link
    await postLinkElement.focus();
    await postLinkElement.hover();

    postUrl = await postLinkElement.evaluate((el) => el.getAttribute('href'));

    if (!postUrl) {
      console.error('[DEBUG ERROR] Post URL not found');
      throw new Error('FATAL!: Post URL not found');
    }

    if (postUrl.indexOf('https://www') !== 0) {
      // url not ready to get
      postUrl = null;
    }
  }

  const post = plainToInstance(FbPostDto, {
    id: matchPost(postUrl),
    groupId: matchGroup(postUrl),
  });
  console.debug(`[DEBUG] Publication successful! Post URL: ${post.url}`);

  return post;
};
