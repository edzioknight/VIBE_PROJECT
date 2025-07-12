import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { UserService } from '../services/user.service';
import UploadConfig from '../config/upload.config';
import { logger } from '../config/logger.config';
import { ApiResponse } from '../types/api.types';
import { RequestWithUser } from '../types/api.types';
import {
  BasicInfoPayload,
  LocationPayload,
  LifestylePayload,
  PreferencesPayload,
  PersonalityPayload,
  ProfileUpdatePayload,
} from '../types/user.types';

// Configure multer for photo uploads
const upload = multer(UploadConfig.getMulterConfig());

export class UserController {
  /**
   * Get user profile
   */
  public static async getProfile(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const userProfile = await UserService.getUserProfile(userId);

      logger.info('User profile retrieved', { userId });

      res.status(200).json({
        success: true,
        data: {
          user: userProfile,
        },
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   */
  public static async updateProfile(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const data: ProfileUpdatePayload = req.body;
      
      const updatedProfile = await UserService.updateUserProfile(userId, data);

      logger.info('User profile updated', { userId });

      res.status(200).json({
        success: true,
        data: {
          message: 'Profile updated successfully',
          user: updatedProfile,
        },
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete basic info step
   */
  public static async signupBasicInfo(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const data: BasicInfoPayload = req.body;
      
      const result = await UserService.completeSignupStep(userId, 'basic-info', data);

      logger.info('Basic info step completed', { userId });

      res.status(200).json({
        success: true,
        data: result,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete location step
   */
  public static async signupLocation(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const data: LocationPayload = req.body;
      
      const result = await UserService.completeSignupStep(userId, 'location', data);

      logger.info('Location step completed', { userId });

      res.status(200).json({
        success: true,
        data: result,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete lifestyle step
   */
  public static async signupLifestyle(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const data: LifestylePayload = req.body;
      
      const result = await UserService.completeSignupStep(userId, 'lifestyle', data);

      logger.info('Lifestyle step completed', { userId });

      res.status(200).json({
        success: true,
        data: result,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete preferences step
   */
  public static async signupPreferences(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const data: PreferencesPayload = req.body;
      
      const result = await UserService.completeSignupStep(userId, 'preferences', data);

      logger.info('Preferences step completed', { userId });

      res.status(200).json({
        success: true,
        data: result,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete personality step
   */
  public static async signupPersonality(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const data: PersonalityPayload = req.body;
      
      const result = await UserService.completeSignupStep(userId, 'personality', data);

      logger.info('Personality step completed', { userId });

      res.status(200).json({
        success: true,
        data: result,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete photos step (final step)
   */
  public static async signupPhotos(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const files = req.files as Express.Multer.File[];
      
      const result = await UserService.completeSignupStep(userId, 'photos', files);

      logger.info('Photos step completed - signup finished', { userId });

      res.status(200).json({
        success: true,
        data: result,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get onboarding status
   */
  public static async getOnboardingStatus(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const isCompleted = await UserService.getOnboardingStatus(userId);

      res.status(200).json({
        success: true,
        data: {
          onboardingCompleted: isCompleted,
        },
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check if user exists by email (public endpoint)
   */
  public static async checkUserExists(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.query;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email is required',
          },
        });
      }

      const user = await UserService.findUserByEmail(email);
      
      res.status(200).json({
        success: true,
        data: {
          exists: !!user,
        },
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID (for admin or internal use)
   */
  public static async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await UserService.findUserById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
      }

      const userProfile = await UserService.getUserProfile(user.id);

      res.status(200).json({
        success: true,
        data: {
          user: userProfile,
        },
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Multer middleware for photo uploads
   */
  public static uploadPhotos = upload.array('photos', 6);

  /**
   * Handle multer errors
   */
  public static handleUploadError(error: any, req: Request, res: Response, next: NextFunction): void {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: 'File size exceeds 5MB limit',
          },
        });
      }
      
      if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'TOO_MANY_FILES',
            message: 'Maximum 6 photos allowed',
          },
        });
      }
    }

    if (error.message.includes('Invalid file type')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FILE_TYPE',
          message: 'Only JPG, JPEG, and PNG files are allowed',
        },
      });
    }

    next(error);
  }
}

export default UserController;