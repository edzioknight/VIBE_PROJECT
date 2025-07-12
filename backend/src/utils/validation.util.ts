import { z } from 'zod';
import { GENDER_OPTIONS, PROFILE_LIMITS, VALIDATION_PATTERNS } from './constants';

// Basic validation schemas
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(1, 'Email is required')
  .max(255, 'Email is too long');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    VALIDATION_PATTERNS.PASSWORD,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

export const nameSchema = z
  .string()
  .min(PROFILE_LIMITS.NAME_MIN_LENGTH, `Name must be at least ${PROFILE_LIMITS.NAME_MIN_LENGTH} characters`)
  .max(PROFILE_LIMITS.NAME_MAX_LENGTH, `Name must be at most ${PROFILE_LIMITS.NAME_MAX_LENGTH} characters`)
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

export const dateOfBirthSchema = z
  .string()
  .refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= PROFILE_LIMITS.MIN_AGE;
    }
    
    return age >= PROFILE_LIMITS.MIN_AGE && age <= PROFILE_LIMITS.MAX_AGE;
  }, `You must be between ${PROFILE_LIMITS.MIN_AGE} and ${PROFILE_LIMITS.MAX_AGE} years old`);

export const genderSchema = z.enum(GENDER_OPTIONS, {
  errorMap: () => ({ message: 'Gender must be male, female, or non-binary' }),
});

export const bioSchema = z
  .string()
  .max(PROFILE_LIMITS.BIO_MAX_LENGTH, `Bio must be at most ${PROFILE_LIMITS.BIO_MAX_LENGTH} characters`)
  .optional();

export const interestsSchema = z
  .array(z.string())
  .max(PROFILE_LIMITS.INTERESTS_MAX_COUNT, `You can select at most ${PROFILE_LIMITS.INTERESTS_MAX_COUNT} interests`)
  .optional();

export const preferencesSchema = z
  .array(z.string())
  .max(PROFILE_LIMITS.PREFERENCES_MAX_COUNT, `You can select at most ${PROFILE_LIMITS.PREFERENCES_MAX_COUNT} preferences`)
  .optional();

// OTP validation schemas
export const otpRequestSchema = z.object({
  email: emailSchema,
});

export const otpVerificationSchema = z.object({
  email: emailSchema,
  code: z.string().length(6, 'OTP code must be 6 digits').regex(/^\d{6}$/, 'OTP code must contain only digits'),
});

// Google sign-in schema
export const googleSignInSchema = z.object({
  idToken: z.string().min(1, 'Google ID token is required'),
});

// Token refresh schema
export const tokenRefreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Signup step schemas
export const basicInfoSchema = z.object({
  name: nameSchema,
  dateOfBirth: dateOfBirthSchema,
  gender: genderSchema,
});

export const locationSchema = z.object({
  country: z.string().min(1, 'Country is required').max(100, 'Country name is too long'),
  state: z.string().max(100, 'State name is too long').optional(),
  city: z.string().max(100, 'City name is too long').optional(),
});

export const lifestyleSchema = z.object({
  exercise: z.string().max(50, 'Exercise preference is too long').optional(),
  education: z.string().max(100, 'Education is too long').optional(),
  job: z.string().max(100, 'Job title is too long').optional(),
  drinking: z.string().max(50, 'Drinking preference is too long').optional(),
  smoking: z.string().max(50, 'Smoking preference is too long').optional(),
  kids: z.string().max(50, 'Kids preference is too long').optional(),
  ethnicity: z.string().max(100, 'Ethnicity is too long').optional(),
  religion: z.string().max(100, 'Religion is too long').optional(),
});

export const preferencesFormSchema = z.object({
  relationshipType: z.string().max(50, 'Relationship type is too long').optional(),
  currentStatus: z.string().max(50, 'Current status is too long').optional(),
  sexuality: z.string().max(50, 'Sexuality is too long').optional(),
  lookingFor: z.string().max(50, 'Looking for preference is too long').optional(),
  preferences: preferencesSchema,
  preferredGenders: z.array(z.string()).optional(),
});

export const personalitySchema = z.object({
  mbti: z.string().length(4, 'MBTI must be 4 characters').regex(/^[A-Z]{4}$/, 'MBTI must be 4 uppercase letters').optional(),
  interests: interestsSchema,
});

// Profile update schema
export const profileUpdateSchema = z.object({
  name: nameSchema.optional(),
  bio: bioSchema,
  mbti: z.string().length(4, 'MBTI must be 4 characters').regex(/^[A-Z]{4}$/, 'MBTI must be 4 uppercase letters').optional(),
  interests: interestsSchema,
  allowSearch: z.boolean().optional(),
  showActivityStatus: z.boolean().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

// Query parameter schemas
export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

// Utility functions
export class ValidationUtil {
  /**
   * Validate request body against a schema
   */
  public static validateBody<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => 
          err.path.length > 0 ? `${err.path.join('.')}: ${err.message}` : err.message
        );
        throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
      }
      throw error;
    }
  }

  /**
   * Validate query parameters against a schema
   */
  public static validateQuery<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => 
          err.path.length > 0 ? `${err.path.join('.')}: ${err.message}` : err.message
        );
        throw new Error(`Query validation failed: ${errorMessages.join(', ')}`);
      }
      throw error;
    }
  }

  /**
   * Validate URL parameters against a schema
   */
  public static validateParams<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => 
          err.path.length > 0 ? `${err.path.join('.')}: ${err.message}` : err.message
        );
        throw new Error(`Parameter validation failed: ${errorMessages.join(', ')}`);
      }
      throw error;
    }
  }

  /**
   * Check if email is valid
   */
  public static isValidEmail(email: string): boolean {
    try {
      emailSchema.parse(email);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if date of birth represents a valid age
   */
  public static isValidAge(dateOfBirth: string): boolean {
    try {
      dateOfBirthSchema.parse(dateOfBirth);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sanitize string input
   */
  public static sanitizeString(input: string): string {
    return input.trim().replace(/\s+/g, ' ');
  }

  /**
   * Validate file upload
   */
  public static validateFileUpload(file: Express.Multer.File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check file size
    if (file.size > 5 * 1024 * 1024) { // 5MB
      errors.push('File size must be less than 5MB');
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push('File must be a JPG, JPEG, or PNG image');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default ValidationUtil;