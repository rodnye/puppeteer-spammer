// redis keys
export const GROUP_KEY_PREFIX = 'fb:group';
export const POST_KEY_PREFIX = 'fb:post';

// get redis keys
export const getGroupRKey = (groupId: string): `fb:group:${string}` =>
  `${GROUP_KEY_PREFIX}:${groupId}`;

export const getPostRKey = (
  groupId: string,
  postId: string
): `fb:post:${string}:${string}` => `${POST_KEY_PREFIX}:${groupId}:${postId}`;
