import { getRedis } from '@/services/core/redis';
import { FbGroupDto } from '@/services/scraper/dto';
import { getGroupRKey, GROUP_KEY_PREFIX } from '../utils';
import { parseDto } from '@/utils/parse-dto';
import { RedisKey } from 'ioredis';

/**
 *
 */
export const findGroup = async (groupId: string) =>
  findGroupByRKey(getGroupRKey(groupId));

/**
 *
 */
export const findGroupByRKey = async (rkey: RedisKey) => {
  const redis = await getRedis();

  const rawGroup = await redis.hgetall(rkey);
  if (!rawGroup || Object.keys(rawGroup).length === 0) {
    return null;
  }

  return parseDto(FbGroupDto, {
    groupId: rawGroup.groupId,
    name: rawGroup.name || null,
    tags: JSON.parse(rawGroup.tags || '[]'),
    postIds: JSON.parse(rawGroup.postIds || '[]'),
  });
};

/**
 *
 */
export const findAllGroups = async (): Promise<FbGroupDto[]> => {
  const redis = await getRedis();
  const groups: FbGroupDto[] = [];

  const groupKeys = await redis.keys(`${GROUP_KEY_PREFIX}:*`);

  for (const groupKey of groupKeys) {
    const group = await findGroupByRKey(groupKey);
    if (group) {
      groups.push(group);
    }
  }

  return groups;
};

/**
 *
 */
export const findGroupsByTag = async (tag: string): Promise<FbGroupDto[]> => {
  const allGroups = await findAllGroups();
  return allGroups.filter((group) => group.tags.includes(tag));
};

/**
 *
 */
export const countGroups = async (): Promise<number> => {
  const redis = await getRedis();
  const groupKeys = await redis.keys(`${GROUP_KEY_PREFIX}:*`);
  return groupKeys.length;
};

/**
 *
 */
export const existsGroup = async (groupId: string) => {
  const redis = await getRedis();
  return (await redis.exists(getGroupRKey(groupId))) === 1;
};
