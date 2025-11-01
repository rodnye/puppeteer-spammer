// redis keys
export const GROUP_KEY_PREFIX = 'group';
export const POST_KEY_PREFIX = 'post';
export const USER_KEY_PREFIX = 'user';

// get redis keys
export const getGroupRKey = (groupId: string): `${typeof GROUP_KEY_PREFIX}:${string}` =>
  `${GROUP_KEY_PREFIX}:${groupId}`;

export const getPostRKey = (
  groupId: string,
  postId: string
): `${typeof POST_KEY_PREFIX}:${string}:${string}` => `${POST_KEY_PREFIX}:${groupId}:${postId}`;

export const getUserRKey = (sessionId: string): `${typeof USER_KEY_PREFIX}:${string}` =>
  `${USER_KEY_PREFIX}:${sessionId}`;