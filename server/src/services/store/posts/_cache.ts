import { RedisKey } from 'ioredis';
import { FbPostDto } from '@/services/scraper/dto';

export const postsCache = new Map<RedisKey, FbPostDto>();
