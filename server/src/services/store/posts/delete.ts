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
  const groupData = await redis.hgetall(groupKey);

  if (groupData && groupData.posts) {
    const postIds = JSON.parse(groupData.posts) as string[];
    const updatedPostIds = postIds.filter((id) => id !== postId);

    await redis.hset(groupKey, 'posts', JSON.stringify(updatedPostIds));
  }
};
