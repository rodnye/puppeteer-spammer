import { logger } from '@/services/core/logger';
import { getPage } from '@/services/core/browser';
import { getFacebookLogin } from './login';
import { FbGroupDto, FbPostDto } from './dto';
import { matchGroup, matchPost } from './utils';
import { parseDto } from '@/utils/parse-dto';

/**
 * extracts group id and post id from a Facebook post URL
 */
export const url2FbPost = async (url: string): Promise<FbPostDto> => {
  const extractGroupId = matchGroup(url);
  const extractPostId = matchPost(url);

  if (!extractGroupId) throw new Error('Not have group id');
  if (!extractPostId) throw new Error('Not have a post id');

  return parseDto(FbPostDto, {
    postId: extractPostId,
    groupId: extractGroupId,
  });
};

/**
 * extracts group id and name from a Facebook group URL
 */
export const url2FbGroup = async (
  url: string,
  opt: { noName?: boolean } = {}
): Promise<FbGroupDto> => {
  const groupId = matchGroup(url);
  if (!groupId) throw new Error('Not have group id');

  let name: string | null = null;

  if (!opt.noName) {
    const page = await getPage();
    await goToGroup(FbGroupDto.makeUrl(groupId))

    // a example of title: "(9) Grupo de prueba | Facebook"
    const title = (await page.title()).trim();

    // remove the "(1)" at the start and "| Facebook" at the end
    name = title.replace(/(^\(\d+?\)|\| Facebook$)/g, '').trim();
  }

  return parseDto(FbGroupDto, {
    groupId,
    name,
    posts: {},
  });
};

/**
 * navigates to a specific Facebook group
 */
export const goToGroup = async (url: string) => {
  const page = await getFacebookLogin();

  logger.browser(`[Navigation] Group: ${url}`);
  await page.goto(url, {
    waitUntil: 'networkidle2',
  });

  return page.url();
};

/**
 * navigates to a specific Facebook Post in group
 */
export const goToPost = async (target: string | FbPostDto) => {
  const page = await getFacebookLogin();

  // get group id and post id
  let post: FbPostDto =
    typeof target === 'string' ? await url2FbPost(target) : target;

  const fullUrl = `https://www.facebook.com/groups/${post.groupId}/posts/${post.postId}`;

  logger.browser(`[Navigation] Post: ${fullUrl}`);
  await page.goto(fullUrl, {
    waitUntil: 'networkidle2',
  });

  return page.url();
};
