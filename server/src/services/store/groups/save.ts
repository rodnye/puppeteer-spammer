import { getRedis } from '@/services/core/redis';
import { FbGroupDto } from '@/services/facebook/dto';
import { savePost } from '../posts/save';
import { getGroupRKey } from '../utils';

/**
 *
 */
export const saveGroup = async (group: FbGroupDto): Promise<void> => {
  const redis = await getRedis();
  const groupKey = getGroupRKey(group.id);

  await redis.hset(groupKey, {
    id: group.id,
    name: group.name || '',
    tags: JSON.stringify(group.tags),
    posts: JSON.stringify(Object.keys(group.posts || {})),
  });

  if (group.posts) {
    for (const post of Object.values(group.posts)) {
      await savePost(post);
    }
  }
};
