const redisUrl = process.env['REDIS_URL'];

export function getRedisUrl(): string | undefined {
  return redisUrl;
}
