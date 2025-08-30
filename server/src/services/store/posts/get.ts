import { plainToInstance } from 'class-transformer';
import { getRedis } from '@/services/core/redis';
import { FbPostDto } from '@/services/facebook/dto';
import { getPostRKey } from '../utils';
import { getAllGroups, getGroup } from '../groups/get';

/**
 *
 */
export const getPost = async (
  groupId: string,
  postId: string
): Promise<FbPostDto | null> => {
  const redis = await getRedis();
  const postKey = getPostRKey(groupId, postId);

  const postData = await redis.hgetall(postKey);
  if (!postData || Object.keys(postData).length === 0) {
    return null;
  }

  return plainToInstance(FbPostDto, {
    id: postData.id,
    groupId: postData.groupId,
    tags: JSON.parse(postData.tags || '[]'),
    desc: postData.desc || '',
  });
};

/**
 *
 */
export const findPostsByTag = async (tag: string): Promise<FbPostDto[]> => {
  const allGroups = await getAllGroups();
  const posts: FbPostDto[] = [];

  for (const group of allGroups) {
    for (const post of Object.values(group.posts)) {
      if (post.tags.includes(tag)) {
        posts.push(post);
      }
    }
  }

  return posts;
};

/**
 *
 */
export const countPostsInGroup = async (groupId: string): Promise<number> => {
  const group = await getGroup(groupId);
  return group ? Object.keys(group.posts).length : 0;
};

/**
 *
 */
export const existsPost = async (groupId, postId) => {
  const redis = await getRedis();
  const postKey = getPostRKey(groupId, postId);

  return (await redis.exists(postKey)) === 1;
};
