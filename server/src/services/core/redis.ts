import Redis from 'ioredis';
import { REDIS_HOST, REDIS_PORT, REDIS_USER, REDIS_PASS } from './config';
import { logger } from './logger';

let redis: Redis;

export const getRedis = async () => {
  if (!redis || redis.status == 'end' || redis.status == 'close') {
    logger.info('[Redis] Connect to host...');
    redis = new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
      username: REDIS_USER,
      password: REDIS_PASS,
    });

    return new Promise<Redis>((resolve, reject) => {
      redis.on('error', (err) => {
        logger.error(err, '[Redis] Connection error.');
        reject();
      });
      redis.on('ready', () => {
        logger.info('[Redis] Done.');
        resolve(redis);
      });
    });
  }

  return redis;
};
