import { getRedis } from '@/services/core/redis';
import { deletePost } from '../posts/delete';
import { getGroupRKey } from '../utils';

/**
 * 
 */
export const deleteGroup = async (groupId: string): Promise<void> => {
  const redis = await getRedis();
  const rkey = getGroupRKey(groupId);

  const groupData = await redis.hgetall(rkey);
  if (groupData && groupData.postIds) {
    const postIds = JSON.parse(groupData.postIds) as string[];

    for (const postId of postIds) {
      await deletePost(groupId, postId);
    }
  }

  await redis.del(rkey);
};
