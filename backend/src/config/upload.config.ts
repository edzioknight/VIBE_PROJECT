import AWS from 'aws-sdk';
import multer from 'multer';
import { logger } from './logger.config';
import { PHOTO_UPLOAD } from '../utils/constants';

class UploadConfig {
  private static s3Instance: AWS.S3;

  public static getS3Instance(): AWS.S3 {
    if (!UploadConfig.s3Instance) {
      AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1',
      });

      UploadConfig.s3Instance = new AWS.S3({
        apiVersion: '2006-03-01',
        signatureVersion: 'v4',
      });
    }

    return UploadConfig.s3Instance;
  }

  public static getMulterConfig(): multer.Options {
    return {
      storage: multer.memoryStorage(),
      limits: {
        fileSize: PHOTO_UPLOAD.MAX_SIZE,
        files: PHOTO_UPLOAD.MAX_PHOTOS,
      },
      fileFilter: (req, file, cb) => {
        // Check file type
        const allowedMimes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
        ];

        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only JPG, JPEG, and PNG files are allowed.'));
        }
      },
    };
  }

  public static async uploadToS3(
    file: Express.Multer.File,
    key: string
  ): Promise<{ url: string; key: string }> {
    try {
      const s3 = UploadConfig.getS3Instance();
      const bucketName = process.env.AWS_BUCKET_NAME;

      if (!bucketName) {
        throw new Error('AWS_BUCKET_NAME environment variable is not set');
      }

      const uploadParams: AWS.S3.PutObjectRequest = {
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
        Metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString(),
        },
      };

      const result = await s3.upload(uploadParams).promise();

      logger.info('File uploaded to S3 successfully', {
        key,
        location: result.Location,
        size: file.size,
      });

      return {
        url: result.Location,
        key: result.Key,
      };
    } catch (error) {
      logger.error('Failed to upload file to S3', {
        error,
        key,
        fileSize: file.size,
        mimetype: file.mimetype,
      });
      throw error;
    }
  }

  public static async deleteFromS3(key: string): Promise<void> {
    try {
      const s3 = UploadConfig.getS3Instance();
      const bucketName = process.env.AWS_BUCKET_NAME;

      if (!bucketName) {
        throw new Error('AWS_BUCKET_NAME environment variable is not set');
      }

      const deleteParams: AWS.S3.DeleteObjectRequest = {
        Bucket: bucketName,
        Key: key,
      };

      await s3.deleteObject(deleteParams).promise();

      logger.info('File deleted from S3 successfully', { key });
    } catch (error) {
      logger.error('Failed to delete file from S3', { error, key });
      throw error;
    }
  }

  public static generateS3Key(userId: string, filename: string): string {
    const timestamp = Date.now();
    const extension = filename.split('.').pop();
    return `users/${userId}/photos/${timestamp}.${extension}`;
  }

  public static async healthCheck(): Promise<boolean> {
    try {
      const s3 = UploadConfig.getS3Instance();
      const bucketName = process.env.AWS_BUCKET_NAME;

      if (!bucketName) {
        return false;
      }

      await s3.headBucket({ Bucket: bucketName }).promise();
      return true;
    } catch (error) {
      logger.error('S3 health check failed', { error });
      return false;
    }
  }
}

export default UploadConfig;