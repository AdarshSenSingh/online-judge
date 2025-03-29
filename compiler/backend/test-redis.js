import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing Upstash Redis connection...');

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined
});

redis.on('connect', () => {
  console.log(`Successfully connected to Redis at ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
  redis.quit();
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
  redis.quit();
});
