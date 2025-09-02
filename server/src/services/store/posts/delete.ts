import { getRedis } from '@/services/core/redis';
import { getPostRKey, getGroupRKey } from '../utils';

/**
 *
 */
export const deletePost = async (
  groupId: string,
  postId: string
): Promise<void> => {
  const redis = await getRedis();
  const postKey = getPostRKey(groupId, postId);

  await redis.del(postKey);

  const groupKey = getGroupRKey(groupId);
  const rawPostIds = await redis.hget(groupKey, 'postIds');

  if (rawPostIds) {
    const postIds = JSON.parse(rawPostIds) as string[];
    postIds.splice(postIds.indexOf(postId), 1);

    await redis.hset(groupKey, 'postIds', JSON.stringify(postIds));
  }
};
