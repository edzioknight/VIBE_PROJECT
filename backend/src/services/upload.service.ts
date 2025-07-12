import sharp from 'sharp';
import UploadConfig from '../config/upload.config';
import { logger } from '../config/logger.config';
import { PhotoUploadResult, PhotoValidationResult } from '../types/user.types';
import { PHOTO_UPLOAD, ERROR_CODES } from '../utils/constants';

export class UploadService {
  /**
   * Upload profile photos for a user
   */
  public static async uploadProfilePhotos(userId: string, files: Express.Multer.File[]): Promise<string[]> {
    try {
      // Validate number of photos
      if (files.length < PHOTO_UPLOAD.MIN_PHOTOS) {
        throw new Error(`At least ${PHOTO_UPLOAD.MIN_PHOTOS} photos are required`);
      }

      if (files.length > PHOTO_UPLOAD.MAX_PHOTOS) {
        throw new Error(`Maximum ${PHOTO_UPLOAD.MAX_PHOTOS} photos allowed`);
      }

      // Validate each photo
      const validationResults = await Promise.all(
        files.map(file => this.validatePhoto(file))
      );

      // Check if all photos are valid
      const invalidPhotos = validationResults.filter(result => !result.isValid);
      if (invalidPhotos.length > 0) {
        const errors = invalidPhotos.flatMap(result => result.errors);
        throw new Error(`Photo validation failed: ${errors.join(', ')}`);
      }

      // Process and upload photos
      const uploadPromises = files.map(async (file, index) => {
        const processedFile = await this.processPhoto(file);
        const key = UploadConfig.generateS3Key(userId, `photo_${index + 1}.jpg`);
        const result = await UploadConfig.uploadToS3(processedFile, key);
        return result.url;
      });

      const photoUrls = await Promise.all(uploadPromises);

      logger.info('Profile photos uploaded successfully', {
        userId,
        photoCount: photoUrls.length,
      });

      return photoUrls;
    } catch (error) {
      logger.error('Failed to upload profile photos', { error, userId });
      throw new Error(ERROR_CODES.UPLOAD_ERROR);
    }
  }

  /**
   * Validate a photo file
   */
  public static async validatePhoto(file: Express.Multer.File): Promise<PhotoValidationResult> {
    const errors: string[] = [];

    try {
      // Check file size
      if (file.size > PHOTO_UPLOAD.MAX_SIZE) {
        errors.push(`File size must be less than ${PHOTO_UPLOAD.MAX_SIZE / (1024 * 1024)}MB`);
      }

      // Check file type
      if (!PHOTO_UPLOAD.ALLOWED_FORMATS.some(format => 
        file.mimetype.includes(format) || file.originalname.toLowerCase().endsWith(`.${format}`)
      )) {
        errors.push(`File must be one of: ${PHOTO_UPLOAD.ALLOWED_FORMATS.join(', ')}`);
      }

      // Check image dimensions and aspect ratio
      try {
        const metadata = await sharp(file.buffer).metadata();
        
        if (!metadata.width || !metadata.height) {
          errors.push('Invalid image file');
        } else {
          const aspectRatio = metadata.width / metadata.height;
          
          if (aspectRatio < PHOTO_UPLOAD.MIN_ASPECT_RATIO || aspectRatio > PHOTO_UPLOAD.MAX_ASPECT_RATIO) {
            errors.push(`Image aspect ratio must be between ${PHOTO_UPLOAD.MIN_ASPECT_RATIO}:1 and ${PHOTO_UPLOAD.MAX_ASPECT_RATIO}:1`);
          }

          // Check minimum dimensions
          if (metadata.width < 400 || metadata.height < 400) {
            errors.push('Image must be at least 400x400 pixels');
          }
        }
      } catch (sharpError) {
        errors.push('Invalid or corrupted image file');
      }

      return {
        isValid: errors.length === 0,
        errors,
        file,
      };
    } catch (error) {
      logger.error('Failed to validate photo', { error, filename: file.originalname });
      return {
        isValid: false,
        errors: ['Failed to validate photo'],
        file,
      };
    }
  }

  /**
   * Process photo (resize, optimize, convert to JPEG)
   */
  public static async processPhoto(file: Express.Multer.File): Promise<Express.Multer.File> {
    try {
      // Process image with Sharp
      const processedBuffer = await sharp(file.buffer)
        .resize(1080, 1080, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({
          quality: 85,
          progressive: true,
        })
        .toBuffer();

      // Return processed file
      return {
        ...file,
        buffer: processedBuffer,
        mimetype: 'image/jpeg',
        size: processedBuffer.length,
        originalname: file.originalname.replace(/\.[^/.]+$/, '.jpg'),
      };
    } catch (error) {
      logger.error('Failed to process photo', { error, filename: file.originalname });
      throw new Error('Failed to process photo');
    }
  }

  /**
   * Delete user photos
   */
  public static async deleteUserPhotos(userId: string, photoUrls: string[]): Promise<void> {
    try {
      const deletePromises = photoUrls.map(async (url) => {
        try {
          // Extract key from URL
          const key = this.extractKeyFromUrl(url);
          if (key) {
            await UploadConfig.deleteFromS3(key);
          }
        } catch (error) {
          logger.warn('Failed to delete photo', { error, url });
        }
      });

      await Promise.all(deletePromises);

      logger.info('User photos deleted successfully', { userId, photoCount: photoUrls.length });
    } catch (error) {
      logger.error('Failed to delete user photos', { error, userId });
      // Don't throw error as this is cleanup operation
    }
  }

  /**
   * Upload single photo
   */
  public static async uploadSinglePhoto(userId: string, file: Express.Multer.File): Promise<PhotoUploadResult> {
    try {
      // Validate photo
      const validation = await this.validatePhoto(file);
      if (!validation.isValid) {
        throw new Error(`Photo validation failed: ${validation.errors.join(', ')}`);
      }

      // Process photo
      const processedFile = await this.processPhoto(file);

      // Generate unique key
      const timestamp = Date.now();
      const key = UploadConfig.generateS3Key(userId, `photo_${timestamp}.jpg`);

      // Upload to S3
      const result = await UploadConfig.uploadToS3(processedFile, key);

      logger.info('Single photo uploaded successfully', { userId, key });

      return {
        url: result.url,
        key: result.key,
        size: processedFile.size,
        format: 'jpeg',
      };
    } catch (error) {
      logger.error('Failed to upload single photo', { error, userId });
      throw new Error(ERROR_CODES.UPLOAD_ERROR);
    }
  }

  /**
   * Extract S3 key from URL
   */
  private static extractKeyFromUrl(url: string): string | null {
    try {
      const bucketName = process.env.AWS_BUCKET_NAME;
      if (!bucketName) return null;

      // Handle different S3 URL formats
      if (url.includes(`${bucketName}.s3.`)) {
        // Format: https://bucket.s3.region.amazonaws.com/key
        const parts = url.split(`${bucketName}.s3.`)[1];
        return parts.split('/').slice(1).join('/');
      } else if (url.includes(`s3.amazonaws.com/${bucketName}/`)) {
        // Format: https://s3.amazonaws.com/bucket/key
        return url.split(`s3.amazonaws.com/${bucketName}/`)[1];
      }

      return null;
    } catch (error) {
      logger.warn('Failed to extract key from URL', { error, url });
      return null;
    }
  }

  /**
   * Get photo metadata
   */
  public static async getPhotoMetadata(file: Express.Multer.File): Promise<{
    width: number;
    height: number;
    format: string;
    size: number;
  }> {
    try {
      const metadata = await sharp(file.buffer).metadata();
      
      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: file.size,
      };
    } catch (error) {
      logger.error('Failed to get photo metadata', { error });
      throw new Error('Failed to analyze photo');
    }
  }

  /**
   * Check if file is a valid image
   */
  public static async isValidImage(file: Express.Multer.File): Promise<boolean> {
    try {
      await sharp(file.buffer).metadata();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default UploadService;