import { getRedis } from '@/services/core/redis';
import { FbUserDto } from '@/services/scraper/dto';
import { USER_KEY_PREFIX, getUserRKey } from '../utils';
import { parseDto } from '@/utils/parse-dto';
import type { RedisKey } from 'ioredis';

/**
 *
 */
export const findUser = async (username: string) =>
  findUserByRKey(getUserRKey(username));

/**
 *
 */
export const findUserByRKey = async (rkey: RedisKey) => {
  const redis = await getRedis();

  const rawUser = await redis.hgetall(rkey);
  if (!rawUser || Object.keys(rawUser).length === 0) {
    return null;
  }

  return parseDto(FbUserDto, {
    user: rawUser.user,
    pass: rawUser.pass,
    fbUser: rawUser.fbUser,
    fbPass: rawUser.fbPass,
    sessionUrl: rawUser.sessionUrl,
  });
};

/**
 *
 */
export const findAllUsers = async (): Promise<FbUserDto[]> => {
  const redis = await getRedis();
  const users: FbUserDto[] = [];

  const userKeys = await redis.keys(`${USER_KEY_PREFIX}:*`);

  for (const userKey of userKeys) {
    const user = await findUserByRKey(userKey);
    if (user) {
      users.push(user);
    }
  }

  return users;
};

/**
 *
 */
export const countUsers = async (): Promise<number> => {
  const redis = await getRedis();
  const userKeys = await redis.keys(`${USER_KEY_PREFIX}:*`);
  return userKeys.length;
};

/**
 *
 */
export const existsUser = async (userId: string) => {
  const redis = await getRedis();
  return (await redis.exists(getUserRKey(userId))) === 1;
};
