// Error Codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INVALID_OTP: 'INVALID_OTP',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_TOKEN: 'INVALID_TOKEN',
  UPLOAD_ERROR: 'UPLOAD_ERROR',
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  EMAIL_SEND_FAILED: 'EMAIL_SEND_FAILED',
  GOOGLE_AUTH_FAILED: 'GOOGLE_AUTH_FAILED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_REVOKED: 'TOKEN_REVOKED',
  OTP_EXPIRED: 'OTP_EXPIRED',
  OTP_MAX_ATTEMPTS: 'OTP_MAX_ATTEMPTS',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_IMAGE_DIMENSIONS: 'INVALID_IMAGE_DIMENSIONS',
  ONBOARDING_INCOMPLETE: 'ONBOARDING_INCOMPLETE',
  PROFILE_UPDATE_FAILED: 'PROFILE_UPDATE_FAILED'
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
} as const;

// Token Types
export const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  TEMP: 'temp'
} as const;

// User Gender Options
export const GENDER_OPTIONS = ['male', 'female', 'non-binary'] as const;

// Signup Steps
export const SIGNUP_STEPS = {
  BASIC_INFO: 'basic-info',
  LOCATION: 'location',
  LIFESTYLE: 'lifestyle',
  PREFERENCES: 'preferences',
  PERSONALITY: 'personality',
  PHOTOS: 'photos'
} as const;

// Photo Upload Constants
export const PHOTO_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MIN_PHOTOS: 2,
  MAX_PHOTOS: 6,
  ALLOWED_FORMATS: ['jpg', 'jpeg', 'png'],
  MIN_ASPECT_RATIO: 1/1, // 1:1
  MAX_ASPECT_RATIO: 4/5  // 4:5
} as const;

// OTP Constants
export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRATION_MS: 5 * 60 * 1000, // 5 minutes
  MAX_ATTEMPTS: 3
} as const;

// Rate Limiting Windows (in milliseconds)
export const RATE_LIMITS = {
  OTP_WINDOW: 60 * 1000, // 1 minute
  OTP_MAX_REQUESTS: 3,
  LOGIN_WINDOW: 15 * 60 * 1000, // 15 minutes
  LOGIN_MAX_REQUESTS: 5,
  API_WINDOW: 60 * 1000, // 1 minute
  API_MAX_REQUESTS: 100,
  PHOTO_UPLOAD_WINDOW: 60 * 60 * 1000, // 1 hour
  PHOTO_UPLOAD_MAX_REQUESTS: 10
} as const;

// JWT Expiration Times
export const JWT_EXPIRATION = {
  ACCESS_TOKEN: '1h',
  REFRESH_TOKEN: '30d',
  TEMP_TOKEN: '1h'
} as const;

// Redis Key Prefixes
export const REDIS_KEYS = {
  OTP_RATE_LIMIT: 'otp_rate_limit:',
  LOGIN_RATE_LIMIT: 'login_rate_limit:',
  API_RATE_LIMIT: 'api_rate_limit:',
  USER_SESSION: 'user_session:',
  TEMP_TOKEN: 'temp_token:'
} as const;

// Email Templates
export const EMAIL_TEMPLATES = {
  OTP_SUBJECT: 'Your VibesMatch Verification Code',
  OTP_TEMPLATE: (code: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e91e63;">VibesMatch</h2>
      <p>Your verification code is:</p>
      <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${code}
      </div>
      <p>This code will expire in 5 minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
    </div>
  `
} as const;

// Validation Patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
} as const;

// User Profile Field Limits
export const PROFILE_LIMITS = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  BIO_MAX_LENGTH: 500,
  INTERESTS_MAX_COUNT: 10,
  PREFERENCES_MAX_COUNT: 5,
  MIN_AGE: 18,
  MAX_AGE: 100
} as const;

// Default Values
export const DEFAULTS = {
  THEME: 'system',
  ALLOW_SEARCH: false,
  SHOW_ACTIVITY_STATUS: true,
  IS_PREMIUM: false,
  IS_VERIFIED: false,
  IS_ACTIVE: true,
  ONBOARDING_COMPLETED: false
} as const;