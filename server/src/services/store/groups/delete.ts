import { getRedis } from '@/services/core/redis';
import { deletePost } from '../posts/delete';
import { getGroupRKey } from '../utils';


export const deleteGroup = async (groupId: string): Promise<void> => {
  const redis = await getRedis();
  const groupKey = getGroupRKey(groupId);

  const groupData = await redis.hgetall(groupKey);
  if (groupData && groupData.posts) {
    const postIds = JSON.parse(groupData.posts) as string[];

    for (const postId of postIds) {
      await deletePost(groupId, postId);
    }
  }

  await redis.del(groupKey);
};
