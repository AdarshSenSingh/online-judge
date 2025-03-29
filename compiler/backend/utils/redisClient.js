import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient = null;

// Only initialize Redis client if SKIP_REDIS is not TRUE
if (process.env.SKIP_REDIS !== 'TRUE') {
  try {
    // Use Docker Redis if available, otherwise use Upstash
    const isDocker = process.env.DOCKER_ENV === 'true';
    
    redisClient = new Redis({
      host: isDocker ? 'redis' : process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: isDocker ? undefined : process.env.REDIS_PASSWORD,
      tls: !isDocker && process.env.REDIS_TLS === 'true' ? {} : undefined,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        return Math.min(times * 50, 2000);
      }
    });

    redisClient.on('error', (err) => {
      console.error('Redis error:', err.message);
    });
    
    redisClient.on('connect', () => {
      console.log('Successfully connected to Redis');
    });
  } catch (error) {
    console.error('Failed to initialize Redis client:', error.message);
    redisClient = null;
  }
}

export default redisClient;
