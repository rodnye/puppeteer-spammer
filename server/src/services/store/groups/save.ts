import { getRedis } from '@/services/core/redis';
import { FbGroupDto } from '@/services/scraper/dto';
import { getGroupRKey } from '../utils';

/**
 *
 */
export const saveGroup = async (group: FbGroupDto): Promise<void> => {
  const redis = await getRedis();
  const rkey = getGroupRKey(group.groupId);

  await redis.hset(rkey, {
    groupId: group.groupId,
    name: group.name || '',
    tags: JSON.stringify(group.tags),
    postIds: JSON.stringify(group.postIds),
  });
};
