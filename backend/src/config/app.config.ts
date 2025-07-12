import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const appConfig = {
  // Server Configuration
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',

  // Database Configuration
  databaseUrl: process.env.DATABASE_URL,

  // Redis Configuration
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key',
    accessTokenExpiration: process.env.ACCESS_TOKEN_EXPIRATION || '1h',
    refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION || '30d',
    tempTokenExpiration: '1h',
  },

  // Email Configuration
  email: {
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: parseInt(process.env.SMTP_PORT || '587'),
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    fromEmail: process.env.FROM_EMAIL || 'noreply@vibesmatch.com',
    fromName: process.env.FROM_NAME || 'VibesMatch',
  },

  // AWS S3 Configuration
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucketName: process.env.AWS_BUCKET_NAME,
    region: process.env.AWS_REGION || 'us-east-1',
  },

  // Google OAuth Configuration
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },

  // Rate Limiting Configuration
  rateLimit: {
    otpWindow: parseInt(process.env.OTP_RATE_LIMIT_WINDOW || '60000'), // 1 minute
    otpMaxRequests: parseInt(process.env.OTP_RATE_LIMIT_MAX_REQUESTS || '3'),
    loginWindow: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW || '900000'), // 15 minutes
    loginMaxRequests: parseInt(process.env.LOGIN_RATE_LIMIT_MAX_REQUESTS || '5'),
    apiWindow: parseInt(process.env.API_RATE_LIMIT_WINDOW || '60000'), // 1 minute
    apiMaxRequests: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS || '100'),
  },

  // OTP Configuration
  otp: {
    length: parseInt(process.env.OTP_LENGTH || '6'),
    expiration: parseInt(process.env.OTP_EXPIRATION || '300000'), // 5 minutes
    maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS || '3'),
  },

  // Photo Upload Configuration
  upload: {
    maxPhotoSize: parseInt(process.env.MAX_PHOTO_SIZE || '5242880'), // 5MB
    minPhotosRequired: parseInt(process.env.MIN_PHOTOS_REQUIRED || '2'),
    maxPhotosAllowed: parseInt(process.env.MAX_PHOTOS_ALLOWED || '6'),
    allowedFormats: (process.env.ALLOWED_PHOTO_FORMATS || 'jpg,jpeg,png').split(','),
  },

  // Security Configuration
  security: {
    bcryptRounds: 12,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    optionsSuccessStatus: 200,
  },

  // Validation
  isProduction: () => appConfig.nodeEnv === 'production',
  isDevelopment: () => appConfig.nodeEnv === 'development',
  isTest: () => appConfig.nodeEnv === 'test',

  // Required environment variables validation
  validateRequiredEnvVars: () => {
    const required = [
      'DATABASE_URL',
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
    ];

    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Warn about optional but recommended variables
    const recommended = [
      'SMTP_USER',
      'SMTP_PASS',
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
      'AWS_BUCKET_NAME',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
    ];

    const missingRecommended = recommended.filter(key => !process.env[key]);
    
    if (missingRecommended.length > 0) {
      console.warn(`Warning: Missing recommended environment variables: ${missingRecommended.join(', ')}`);
    }
  },
};

// Validate environment variables on startup
appConfig.validateRequiredEnvVars();

export default appConfig;