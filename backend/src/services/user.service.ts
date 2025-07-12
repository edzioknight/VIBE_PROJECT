import { User } from '@prisma/client';
import { prisma } from '../config/database.config';
import { logger } from '../config/logger.config';
import { TokenService } from './token.service';
import { UploadService } from './upload.service';
import { EmailService } from './email.service';
import {
  UserProfile,
  UserCreateData,
  UserUpdateData,
  BasicInfoPayload,
  LocationPayload,
  LifestylePayload,
  PreferencesPayload,
  PersonalityPayload,
  SignupStepResponse,
  ProfileUpdatePayload,
} from '../types/user.types';
import { SIGNUP_STEPS, ERROR_CODES } from '../utils/constants';

export class UserService {
  /**
   * Create a new user
   */
  public static async createUser(data: UserCreateData): Promise<User> {
    try {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          googleId: data.googleId,
          name: data.name || data.email.split('@')[0],
          // Set temporary values that will be updated during onboarding
          dateOfBirth: new Date('1990-01-01'),
          gender: 'male',
          country: 'Unknown',
        },
      });

      logger.info('User created successfully', { userId: user.id, email: user.email });
      return user;
    } catch (error) {
      logger.error('Failed to create user', { error, email: data.email });
      throw new Error(ERROR_CODES.DUPLICATE_EMAIL);
    }
  }

  /**
   * Find user by email
   */
  public static async findUserByEmail(email: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      logger.error('Failed to find user by email', { error, email });
      return null;
    }
  }

  /**
   * Find user by ID
   */
  public static async findUserById(id: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error('Failed to find user by ID', { error, id });
      return null;
    }
  }

  /**
   * Get user profile
   */
  public static async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error(ERROR_CODES.USER_NOT_FOUND);
      }

      return this.formatUserProfile(user);
    } catch (error) {
      logger.error('Failed to get user profile', { error, userId });
      throw error;
    }
  }

  /**
   * Update user data
   */
  public static async updateUser(userId: string, data: UserUpdateData): Promise<User> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      logger.info('User updated successfully', { userId });
      return user;
    } catch (error) {
      logger.error('Failed to update user', { error, userId });
      throw new Error(ERROR_CODES.PROFILE_UPDATE_FAILED);
    }
  }

  /**
   * Update user profile (editable fields only)
   */
  public static async updateUserProfile(userId: string, data: ProfileUpdatePayload): Promise<UserProfile> {
    try {
      const user = await this.updateUser(userId, {
        name: data.name,
        bio: data.bio,
        mbti: data.mbti,
        interests: data.interests,
        allowSearch: data.allowSearch,
        showActivityStatus: data.showActivityStatus,
        theme: data.theme,
        lastActive: new Date(),
      });

      return this.formatUserProfile(user);
    } catch (error) {
      logger.error('Failed to update user profile', { error, userId });
      throw error;
    }
  }

  /**
   * Complete signup step
   */
  public static async completeSignupStep(
    userId: string,
    step: string,
    data: any
  ): Promise<SignupStepResponse> {
    try {
      const user = await this.findUserById(userId);
      if (!user) {
        throw new Error(ERROR_CODES.USER_NOT_FOUND);
      }

      let updateData: UserUpdateData = {};
      let nextStep: string | undefined;

      switch (step) {
        case SIGNUP_STEPS.BASIC_INFO:
          updateData = await this.handleBasicInfoStep(data as BasicInfoPayload);
          nextStep = SIGNUP_STEPS.LOCATION;
          break;

        case SIGNUP_STEPS.LOCATION:
          updateData = await this.handleLocationStep(data as LocationPayload);
          nextStep = SIGNUP_STEPS.LIFESTYLE;
          break;

        case SIGNUP_STEPS.LIFESTYLE:
          updateData = await this.handleLifestyleStep(data as LifestylePayload);
          nextStep = SIGNUP_STEPS.PREFERENCES;
          break;

        case SIGNUP_STEPS.PREFERENCES:
          updateData = await this.handlePreferencesStep(data as PreferencesPayload);
          nextStep = SIGNUP_STEPS.PERSONALITY;
          break;

        case SIGNUP_STEPS.PERSONALITY:
          updateData = await this.handlePersonalityStep(data as PersonalityPayload);
          nextStep = SIGNUP_STEPS.PHOTOS;
          break;

        case SIGNUP_STEPS.PHOTOS:
          return await this.handlePhotosStep(userId, data);

        default:
          throw new Error('Invalid signup step');
      }

      // Update user with step data
      await this.updateUser(userId, updateData);

      logger.info('Signup step completed', { userId, step });

      return {
        message: `${step.replace('-', ' ')} saved successfully`,
        nextStep,
      };
    } catch (error) {
      logger.error('Failed to complete signup step', { error, userId, step });
      throw error;
    }
  }

  /**
   * Update last active timestamp
   */
  public static async updateLastActive(userId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { lastActive: new Date() },
      });
    } catch (error) {
      logger.error('Failed to update last active', { error, userId });
      // Don't throw error as this is not critical
    }
  }

  /**
   * Handle basic info step
   */
  private static async handleBasicInfoStep(data: BasicInfoPayload): Promise<UserUpdateData> {
    return {
      name: data.name,
      dateOfBirth: new Date(data.dateOfBirth),
      gender: data.gender,
    };
  }

  /**
   * Handle location step
   */
  private static async handleLocationStep(data: LocationPayload): Promise<UserUpdateData> {
    return {
      country: data.country,
      state: data.state,
      city: data.city,
    };
  }

  /**
   * Handle lifestyle step
   */
  private static async handleLifestyleStep(data: LifestylePayload): Promise<UserUpdateData> {
    return {
      exercise: data.exercise,
      education: data.education,
      job: data.job,
      drinking: data.drinking,
      smoking: data.smoking,
      kids: data.kids,
      ethnicity: data.ethnicity,
      religion: data.religion,
    };
  }

  /**
   * Handle preferences step
   */
  private static async handlePreferencesStep(data: PreferencesPayload): Promise<UserUpdateData> {
    return {
      relationshipType: data.relationshipType,
      currentStatus: data.currentStatus,
      sexuality: data.sexuality,
      lookingFor: data.lookingFor,
      preferences: data.preferences || [],
      preferredGenders: data.preferredGenders || [],
    };
  }

  /**
   * Handle personality step
   */
  private static async handlePersonalityStep(data: PersonalityPayload): Promise<UserUpdateData> {
    return {
      mbti: data.mbti,
      interests: data.interests || [],
    };
  }

  /**
   * Handle photos step (final step)
   */
  private static async handlePhotosStep(userId: string, files: Express.Multer.File[]): Promise<SignupStepResponse> {
    try {
      // Upload photos
      const photoUrls = await UploadService.uploadProfilePhotos(userId, files);

      // Update user with photos and mark onboarding as complete
      const user = await this.updateUser(userId, {
        profilePhotos: photoUrls,
        onboardingCompleted: true,
        lastActive: new Date(),
      });

      // Generate auth tokens
      const tokens = await TokenService.generateAuthTokens(user.id, user.email);

      // Send welcome email
      try {
        await EmailService.sendWelcomeEmail(user.email, user.name);
      } catch (emailError) {
        // Don't fail signup if welcome email fails
        logger.warn('Failed to send welcome email', { emailError, userId });
      }

      logger.info('Signup completed successfully', { userId });

      return {
        message: 'Signup completed successfully',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: this.formatUserProfile(user),
      };
    } catch (error) {
      logger.error('Failed to complete photos step', { error, userId });
      throw error;
    }
  }

  /**
   * Format user data for API response
   */
  private static formatUserProfile(user: User): UserProfile {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      dateOfBirth: user.dateOfBirth.toISOString(),
      gender: user.gender,
      country: user.country,
      state: user.state,
      city: user.city,
      bio: user.bio,
      profilePhotos: user.profilePhotos,
      exercise: user.exercise,
      education: user.education,
      job: user.job,
      drinking: user.drinking,
      smoking: user.smoking,
      kids: user.kids,
      ethnicity: user.ethnicity,
      religion: user.religion,
      relationshipType: user.relationshipType,
      currentStatus: user.currentStatus,
      sexuality: user.sexuality,
      lookingFor: user.lookingFor,
      preferences: user.preferences,
      preferredGenders: user.preferredGenders,
      mbti: user.mbti,
      interests: user.interests,
      allowSearch: user.allowSearch,
      showActivityStatus: user.showActivityStatus,
      theme: user.theme,
      isPremium: user.isPremium,
      premiumExpiresAt: user.premiumExpiresAt?.toISOString(),
      isVerified: user.isVerified,
      onboardingCompleted: user.onboardingCompleted,
      lastActive: user.lastActive.toISOString(),
      createdAt: user.createdAt.toISOString(),
    };
  }

  /**
   * Check if user exists
   */
  public static async userExists(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      return !!user;
    } catch (error) {
      logger.error('Failed to check if user exists', { error, userId });
      return false;
    }
  }

  /**
   * Get user's onboarding status
   */
  public static async getOnboardingStatus(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { onboardingCompleted: true },
      });
      return user?.onboardingCompleted || false;
    } catch (error) {
      logger.error('Failed to get onboarding status', { error, userId });
      return false;
    }
  }
}

export default UserService;