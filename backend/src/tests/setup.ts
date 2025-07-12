import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import RedisConfig from '../config/redis.config';

// Test database instance
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/vibesmatch_test',
    },
  },
});

// Global test setup
beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
  
  // Connect to Redis
  await RedisConfig.connect();
  
  // Run migrations
  // Note: In a real setup, you'd run migrations here
  console.log('Test environment setup complete');
});

// Global test teardown
afterAll(async () => {
  // Disconnect from database
  await prisma.$disconnect();
  
  // Disconnect from Redis
  await RedisConfig.disconnect();
  
  console.log('Test environment teardown complete');
});

// Clean up before each test
beforeEach(async () => {
  // Clear Redis cache
  try {
    const client = RedisConfig.getInstance();
    await client.flushDb();
  } catch (error) {
    console.warn('Failed to clear Redis cache:', error);
  }
});

// Clean up after each test
afterEach(async () => {
  // Clean up database tables in reverse dependency order
  try {
    await prisma.authToken.deleteMany();
    await prisma.otpCode.deleteMany();
    await prisma.userSession.deleteMany();
    await prisma.user.deleteMany();
  } catch (error) {
    console.warn('Failed to clean up database:', error);
  }
});

// Export test utilities
export { prisma };

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.REDIS_URL = 'redis://localhost:6379/1'; // Use different DB for tests