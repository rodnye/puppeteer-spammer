import { getFacebookLogin } from './login';
import { FbGroupDto, FbPostDto } from './dto';
import { plainToInstance } from 'class-transformer';
import { getBrowser } from '@/services/core/browser';

const matchGroup = (s: string) => /(\/groups\/|^)(\d{10,})/.exec(s)?.[2];
const matchPost = (s: string) => /(\/posts\/|^)(\d{10,})/.exec(s)?.[2];

/**
 * extracts group id and post id from a Facebook post URL
 */
export const url2FbPost = async (url: string): Promise<FbPostDto> => {
  const extractGroupId = matchGroup(url);
  const extractPostId = matchPost(url);

  if (!extractGroupId) throw new Error('Not have group id');
  if (!extractPostId) throw new Error('Not have a post id');

  return plainToInstance(FbPostDto, {
    id: extractPostId,
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
  const extractGroupId = matchGroup(url);
  if (!extractGroupId) throw new Error('Not have group id');

  let groupName: string | null = null;

  if (!opt.noName) {
    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.goto(`https://www.facebook.com/groups/${extractGroupId}`, {
      waitUntil: 'networkidle2',
    });

    // A example of title: "(9) Grupo de prueba | Facebook"
    const title = (await page.title()).trim();

    // Remove the "(1)" at the start and "| Facebook" at the end
    groupName = title.replace(/(^\(\d+?\)|\| Facebook$)/g, '').trim();

    await page.close();
  }

  return plainToInstance(FbGroupDto, {
    id: extractGroupId,
    name: groupName,
    posts: {},
  });
};

/**
 * navigates to a specific Facebook group
 */
export const goToGroup = async (target: string | FbGroupDto | FbPostDto) => {
  const page = await getFacebookLogin();

  // get group id
  let groupId: string;
  if (typeof target === 'string') {
    groupId = (await url2FbGroup(target, { noName: true })).id;
  } else if (target instanceof FbGroupDto) {
    groupId = target.id;
  } else {
    groupId = target.groupId;
  }

  const fullUrl = `https://www.facebook.com/groups/${groupId}`;
  console.debug(`[DEBUG] Navigating to group: ${target}`);
  await page.goto(fullUrl, {
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

  const fullUrl = `https://www.facebook.com/groups/${post.groupId}/posts/${post.id}`;

  console.debug(`[DEBUG] Navigating to group: ${fullUrl}`);
  await page.goto(fullUrl, {
    waitUntil: 'networkidle2',
  });

  return page.url();
};
