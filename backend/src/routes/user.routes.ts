import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { ValidationMiddleware } from '../middleware/validation.middleware';
import { RateLimitMiddleware } from '../middleware/rateLimit.middleware';
import { AuthMiddleware } from '../middleware/auth.middleware';
import {
  profileUpdateSchema,
  idParamSchema,
  emailSchema,
} from '../utils/validation.util';
import { z } from 'zod';

const router = Router();

// Profile Routes
router.get(
  '/profile',
  AuthMiddleware.authenticateToken,
  AuthMiddleware.requireOnboarding,
  RateLimitMiddleware.apiRateLimit(),
  UserController.getProfile
);

router.put(
  '/profile',
  AuthMiddleware.authenticateToken,
  AuthMiddleware.requireOnboarding,
  RateLimitMiddleware.apiRateLimit(),
  ValidationMiddleware.validateBody(profileUpdateSchema),
  ValidationMiddleware.sanitizeBody(['name', 'bio', 'mbti']),
  UserController.updateProfile
);

// Onboarding Status
router.get(
  '/onboarding-status',
  AuthMiddleware.authenticateToken,
  UserController.getOnboardingStatus
);

// Public Routes
router.get(
  '/check-exists',
  ValidationMiddleware.validateQuery(z.object({
    email: emailSchema,
  })),
  UserController.checkUserExists
);

// Admin/Internal Routes (would typically require admin auth)
router.get(
  '/:id',
  ValidationMiddleware.validateParams(idParamSchema),
  UserController.getUserById
);

export default router;