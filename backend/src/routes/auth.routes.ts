import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { UserController } from '../controllers/user.controller';
import { ValidationMiddleware } from '../middleware/validation.middleware';
import { RateLimitMiddleware } from '../middleware/rateLimit.middleware';
import { AuthMiddleware } from '../middleware/auth.middleware';
import {
  otpRequestSchema,
  otpVerificationSchema,
  googleSignInSchema,
  tokenRefreshSchema,
  basicInfoSchema,
  locationSchema,
  lifestyleSchema,
  preferencesFormSchema,
  personalitySchema,
} from '../utils/validation.util';

const router = Router();

// OTP Routes
router.post(
  '/send-otp',
  RateLimitMiddleware.otpRateLimit(),
  ValidationMiddleware.validateBody(otpRequestSchema),
  ValidationMiddleware.sanitizeBody(['email']),
  AuthController.sendOtp
);

router.post(
  '/verify-otp',
  RateLimitMiddleware.loginRateLimit(),
  ValidationMiddleware.validateBody(otpVerificationSchema),
  ValidationMiddleware.sanitizeBody(['email']),
  AuthController.verifyOtp
);

// Google OAuth Routes
router.post(
  '/google-signin',
  RateLimitMiddleware.loginRateLimit(),
  ValidationMiddleware.validateBody(googleSignInSchema),
  AuthController.googleSignIn
);

// Token Management Routes
router.post(
  '/refresh',
  ValidationMiddleware.validateBody(tokenRefreshSchema),
  AuthController.refreshToken
);

router.post(
  '/logout',
  AuthMiddleware.authenticateToken,
  AuthController.logout
);

router.post(
  '/logout-all',
  AuthMiddleware.authenticateToken,
  AuthController.revokeAllTokens
);

// Authentication Status Routes
router.get(
  '/status',
  AuthMiddleware.authenticateToken,
  AuthController.getAuthStatus
);

router.post(
  '/validate-token',
  AuthController.validateToken
);

// Signup Flow Routes
router.post(
  '/signup/basic-info',
  AuthMiddleware.authenticateTempToken,
  ValidationMiddleware.validateBody(basicInfoSchema),
  ValidationMiddleware.sanitizeBody(['name']),
  UserController.signupBasicInfo
);

router.post(
  '/signup/location',
  AuthMiddleware.authenticateTempToken,
  ValidationMiddleware.validateBody(locationSchema),
  ValidationMiddleware.sanitizeBody(['country', 'state', 'city']),
  UserController.signupLocation
);

router.post(
  '/signup/lifestyle',
  AuthMiddleware.authenticateTempToken,
  ValidationMiddleware.validateBody(lifestyleSchema),
  ValidationMiddleware.sanitizeBody([
    'exercise', 'education', 'job', 'drinking', 
    'smoking', 'kids', 'ethnicity', 'religion'
  ]),
  UserController.signupLifestyle
);

router.post(
  '/signup/preferences',
  AuthMiddleware.authenticateTempToken,
  ValidationMiddleware.validateBody(preferencesFormSchema),
  UserController.signupPreferences
);

router.post(
  '/signup/personality',
  AuthMiddleware.authenticateTempToken,
  ValidationMiddleware.validateBody(personalitySchema),
  ValidationMiddleware.sanitizeBody(['mbti']),
  UserController.signupPersonality
);

router.post(
  '/signup/photos',
  AuthMiddleware.authenticateTempToken,
  RateLimitMiddleware.photoUploadRateLimit(),
  UserController.uploadPhotos,
  UserController.handleUploadError,
  ValidationMiddleware.validateFiles({
    required: true,
    minFiles: 2,
    maxFiles: 6,
    fieldName: 'photos',
  }),
  UserController.signupPhotos
);

export default router;