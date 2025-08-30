import { getRedis } from '@/services/core/redis';
import { FbPostDto } from '@/services/facebook/dto';
import { getGroupRKey, getPostRKey } from '../utils';

/**
 *
 */
export const savePost = async (post: FbPostDto): Promise<void> => {
  const redis = await getRedis();
  const groupKey = getGroupRKey(post.groupId);
  const postKey = getPostRKey(post.groupId, post.id);

  await redis.hset(postKey, {
    id: post.id,
    groupId: post.groupId,
    tags: JSON.stringify(post.tags),
    desc: post.desc || '',
  });

  // update the group post ids
  const groupData = await redis.hgetall(groupKey);
  if (groupData && groupData.posts) {
    const postIds = JSON.parse(groupData.posts) as string[];
    postIds.push(post.id);

    await redis.hset(groupKey, 'posts', JSON.stringify(postIds));
  }
};
