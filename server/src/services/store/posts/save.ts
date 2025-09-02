import { getRedis } from '@/services/core/redis';
import { FbPostDto } from '@/services/scraper/dto';
import { getGroupRKey, getPostRKey } from '../utils';

/**
 *
 */
export const savePost = async (post: FbPostDto): Promise<void> => {
  const redis = await getRedis();
  const groupKey = getGroupRKey(post.groupId);
  const postKey = getPostRKey(post.groupId, post.postId);

  await redis.hset(postKey, {
    postId: post.postId,
    groupId: post.groupId,
    tags: JSON.stringify(post.tags),
    desc: post.desc,
  });

  // update the group post ids
  const rawPostIds = await redis.hget(groupKey, 'postIds');
  if (rawPostIds) {
    const postIds = JSON.parse(rawPostIds) as string[];
    postIds.push(post.postId);

    await redis.hset(groupKey, 'postIds', JSON.stringify(postIds));
  }
};
