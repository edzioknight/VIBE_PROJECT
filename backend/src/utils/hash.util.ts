import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { appConfig } from '../config/app.config';
import { logger } from '../config/logger.config';

export class HashUtil {
  /**
   * Hash a string using bcrypt
   */
  public static async hashString(plainText: string): Promise<string> {
    try {
      const saltRounds = appConfig.security.bcryptRounds;
      return await bcrypt.hash(plainText, saltRounds);
    } catch (error) {
      logger.error('Failed to hash string', { error });
      throw new Error('Hashing failed');
    }
  }

  /**
   * Compare a plain text string with a hash
   */
  public static async compareHash(plainText: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainText, hash);
    } catch (error) {
      logger.error('Failed to compare hash', { error });
      throw new Error('Hash comparison failed');
    }
  }

  /**
   * Generate a random OTP code
   */
  public static generateOtpCode(length: number = 6): string {
    try {
      const digits = '0123456789';
      let otp = '';
      
      for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, digits.length);
        otp += digits[randomIndex];
      }
      
      return otp;
    } catch (error) {
      logger.error('Failed to generate OTP code', { error });
      throw new Error('OTP generation failed');
    }
  }

  /**
   * Generate a secure random token
   */
  public static generateSecureToken(length: number = 32): string {
    try {
      return crypto.randomBytes(length).toString('hex');
    } catch (error) {
      logger.error('Failed to generate secure token', { error });
      throw new Error('Token generation failed');
    }
  }

  /**
   * Generate a session token
   */
  public static generateSessionToken(): string {
    try {
      const timestamp = Date.now().toString();
      const randomBytes = crypto.randomBytes(16).toString('hex');
      return `${timestamp}_${randomBytes}`;
    } catch (error) {
      logger.error('Failed to generate session token', { error });
      throw new Error('Session token generation failed');
    }
  }

  /**
   * Hash a token for storage (one-way)
   */
  public static hashToken(token: string): string {
    try {
      return crypto.createHash('sha256').update(token).digest('hex');
    } catch (error) {
      logger.error('Failed to hash token', { error });
      throw new Error('Token hashing failed');
    }
  }

  /**
   * Generate a UUID v4
   */
  public static generateUuid(): string {
    try {
      return crypto.randomUUID();
    } catch (error) {
      logger.error('Failed to generate UUID', { error });
      throw new Error('UUID generation failed');
    }
  }

  /**
   * Generate a random string with custom characters
   */
  public static generateRandomString(
    length: number,
    characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  ): string {
    try {
      let result = '';
      for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, characters.length);
        result += characters[randomIndex];
      }
      return result;
    } catch (error) {
      logger.error('Failed to generate random string', { error });
      throw new Error('Random string generation failed');
    }
  }

  /**
   * Create a hash for password reset tokens, email verification, etc.
   */
  public static createVerificationHash(data: string): string {
    try {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512').toString('hex');
      return `${salt}:${hash}`;
    } catch (error) {
      logger.error('Failed to create verification hash', { error });
      throw new Error('Verification hash creation failed');
    }
  }

  /**
   * Verify a verification hash
   */
  public static verifyVerificationHash(data: string, storedHash: string): boolean {
    try {
      const [salt, hash] = storedHash.split(':');
      const verifyHash = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512').toString('hex');
      return hash === verifyHash;
    } catch (error) {
      logger.error('Failed to verify verification hash', { error });
      return false;
    }
  }

  /**
   * Generate a time-based hash (useful for rate limiting keys)
   */
  public static generateTimeBasedHash(identifier: string, windowMs: number): string {
    try {
      const window = Math.floor(Date.now() / windowMs);
      return crypto.createHash('md5').update(`${identifier}:${window}`).digest('hex');
    } catch (error) {
      logger.error('Failed to generate time-based hash', { error });
      throw new Error('Time-based hash generation failed');
    }
  }
}

export default HashUtil;