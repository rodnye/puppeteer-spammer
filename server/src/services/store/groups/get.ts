import { plainToInstance } from 'class-transformer';
import { getRedis } from '@/services/core/redis';
import { FbGroupDto, FbPostDto } from '@/services/facebook/dto';
import { getPost } from '../posts/get';
import { getGroupRKey, GROUP_KEY_PREFIX } from '../utils';

/**
 *
 */
export const getGroup = async (groupId: string): Promise<FbGroupDto | null> => {
  const redis = await getRedis();
  const groupKey = getGroupRKey(groupId);

  const groupData = await redis.hgetall(groupKey);
  if (!groupData || Object.keys(groupData).length === 0) {
    return null;
  }

  const postIds = JSON.parse(groupData.posts || '[]') as string[];

  const posts: Record<string, FbPostDto> = {};
  for (const postId of postIds) {
    const post = await getPost(groupId, postId);
    if (post) {
      posts[postId] = post;
    }
  }

  return plainToInstance(FbGroupDto, {
    id: groupData.id,
    name: groupData.name || null,
    tags: JSON.parse(groupData.tags || '[]'),
    posts: posts,
  });
};

/**
 *
 */
export const getAllGroups = async (): Promise<FbGroupDto[]> => {
  const redis = await getRedis();
  const groups: FbGroupDto[] = [];

  const groupKeys = await redis.keys(`${GROUP_KEY_PREFIX}*`);

  for (const groupKey of groupKeys) {
    const groupId = groupKey.replace(GROUP_KEY_PREFIX, '');
    const group = await getGroup(groupId);
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
  const allGroups = await getAllGroups();
  return allGroups.filter((group) => group.tags.includes(tag));
};

/**
 *
 */
export const countGroups = async (): Promise<number> => {
  const redis = await getRedis();
  const groupKeys = await redis.keys(`${GROUP_KEY_PREFIX}*`);
  return groupKeys.length;
};

/**
 * 
 */
export const existsGroup = async (groupId) => {
  const redis = await getRedis();
  return (await redis.exists(getGroupRKey(groupId))) === 1
}