import Redis from 'ioredis';
import { REDIS_HOST, REDIS_PORT, REDIS_USER, REDIS_PASS } from './config';

let redis: Redis;

export const getRedis = async () => {
  if (!redis || redis.status == 'end' || redis.status == 'close') {
    redis = new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
      username: REDIS_USER,
      password: REDIS_PASS,
    });

    return new Promise<Redis>((resolve, reject) => {
      redis.on('ready', () => resolve(redis));
      redis.on('error', (err) => {
        console.error('❌ Error de conexión a Redis:', err);
        reject();
      });
    });
  }

  return redis;
};
