import { getRedis } from '@/services/core/redis';
import { FbPostDto } from '@/services/scraper/dto';
import { getPostRKey, POST_KEY_PREFIX } from '../utils';
import { findGroup } from '../groups/find';
import { parseDto } from '@/utils/parse-dto';
import { RedisKey } from 'ioredis';
import { postsCache } from './_cache';

/**
 *
 */
export const findPost = async (groupId: string, postId: string) =>
  findPostByRKey(getPostRKey(groupId, postId));

/**
 * 
 */
export const findPostByRKey = async (rkey: RedisKey) => {
  const cached = postsCache.get(rkey);
  if (cached) return cached;

  const redis = await getRedis();
  const rawPost = await redis.hgetall(rkey);
  if (!rawPost || Object.keys(rawPost).length === 0) {
    return null;
  }

  const dto = parseDto(FbPostDto, {
    postId: rawPost.postId,
    groupId: rawPost.groupId,
    tags: JSON.parse(rawPost.tags || '[]'),
    desc: rawPost.desc,
  });
  postsCache.set(rkey, dto);
  return dto;
};

export const findPostsByTag = async (
  tag?: string,
  pageIndex = 0,
  pageSize = 10
) => {
  const redis = await getRedis();
  const rkeys = await redis.keys(`${POST_KEY_PREFIX}:*`);
  const posts: FbPostDto[] = [];

  for (const rkey of rkeys) {
    const post = (await findPostByRKey(rkey))!;
    if (!tag || post.tags.includes(tag)) {
      posts.push(post);
    }
  }

  const startIndex = pageIndex * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedPosts = posts.slice(startIndex, endIndex);
  const pageCount = Math.ceil(posts.length / pageSize);

  return {
    posts: paginatedPosts,
    pageIndex,
    pageCount,
    hasNext: pageIndex < pageCount - 1,
    hasPrev: pageIndex > 0,
  };
};

export const findPostsByGroup = async (groupId: string) => {
  const group = await findGroup(groupId);
  const posts: FbPostDto[] = [];

  if (group)
    for (const postId of group.postIds)
      posts.push((await findPost(groupId, postId))!);

  return posts;
};

/**
 *
 */
export const countPostsInGroup = async (groupId: string): Promise<number> => {
  const group = await findGroup(groupId);
  return group ? Object.keys(group.postIds).length : 0;
};

/**
 *
 */
export const existsPost = async (groupId: string, postId: string) => {
  const redis = await getRedis();
  return (await redis.exists(getPostRKey(groupId, postId))) === 1;
};
