import Redis from 'redis';

const redisClient = Redis.createClient();

redisClient.on('connect', () => console.log('Redis connected'));
redisClient.on('error', (err) => console.error('Redis error:', err));

export default redisClient;