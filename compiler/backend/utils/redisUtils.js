import redisClient from './redisClient.js';

// Function to check if Redis is available
export const checkRedisAvailability = async () => {
  // If SKIP_REDIS is TRUE, return false without attempting connection
  if (process.env.SKIP_REDIS === 'TRUE') {
    console.log('Redis check skipped due to SKIP_REDIS=TRUE');
    return false;
  }
  
  // If Redis client wasn't initialized, return false
  if (!redisClient) {
    console.log('Redis client not initialized');
    return false;
  }
  
  try {
    // Try to ping Redis
    await redisClient.ping();
    return true;
  } catch (error) {
    console.log(`Redis is not available: ${error.message}`);
    return false;
  }
};