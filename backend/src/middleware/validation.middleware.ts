import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationUtil } from '../utils/validation.util';
import { ERROR_CODES } from '../utils/constants';

export class ValidationMiddleware {
  /**
   * Validate request body
   */
  public static validateBody<T>(schema: z.ZodSchema<T>) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        req.body = ValidationUtil.validateBody(schema, req.body);
        next();
      } catch (error) {
        const validationError = new Error(ERROR_CODES.VALIDATION_ERROR);
        (validationError as any).details = [error.message];
        next(validationError);
      }
    };
  }

  /**
   * Validate query parameters
   */
  public static validateQuery<T>(schema: z.ZodSchema<T>) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        req.query = ValidationUtil.validateQuery(schema, req.query);
        next();
      } catch (error) {
        const validationError = new Error(ERROR_CODES.VALIDATION_ERROR);
        (validationError as any).details = [error.message];
        next(validationError);
      }
    };
  }

  /**
   * Validate URL parameters
   */
  public static validateParams<T>(schema: z.ZodSchema<T>) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        req.params = ValidationUtil.validateParams(schema, req.params);
        next();
      } catch (error) {
        const validationError = new Error(ERROR_CODES.VALIDATION_ERROR);
        (validationError as any).details = [error.message];
        next(validationError);
      }
    };
  }

  /**
   * Validate file uploads
   */
  public static validateFiles(options: {
    required?: boolean;
    minFiles?: number;
    maxFiles?: number;
    fieldName?: string;
  } = {}) {
    return (req: Request, res: Response, next: NextFunction) => {
      const {
        required = false,
        minFiles = 1,
        maxFiles = 6,
        fieldName = 'photos',
      } = options;

      try {
        const files = req.files as Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
        let fileArray: Express.Multer.File[] = [];

        if (Array.isArray(files)) {
          fileArray = files;
        } else if (files && files[fieldName]) {
          fileArray = files[fieldName];
        }

        // Check if files are required
        if (required && fileArray.length === 0) {
          const error = new Error(ERROR_CODES.VALIDATION_ERROR);
          (error as any).details = ['Files are required'];
          return next(error);
        }

        // Check minimum files
        if (fileArray.length > 0 && fileArray.length < minFiles) {
          const error = new Error(ERROR_CODES.VALIDATION_ERROR);
          (error as any).details = [`At least ${minFiles} file(s) required`];
          return next(error);
        }

        // Check maximum files
        if (fileArray.length > maxFiles) {
          const error = new Error(ERROR_CODES.VALIDATION_ERROR);
          (error as any).details = [`Maximum ${maxFiles} file(s) allowed`];
          return next(error);
        }

        // Validate each file
        const validationPromises = fileArray.map(file => 
          ValidationUtil.validateFileUpload(file)
        );

        const validationResults = validationPromises.map(result => result);
        const invalidFiles = validationResults.filter(result => !result.isValid);

        if (invalidFiles.length > 0) {
          const errors = invalidFiles.flatMap(result => result.errors);
          const error = new Error(ERROR_CODES.VALIDATION_ERROR);
          (error as any).details = errors;
          return next(error);
        }

        next();
      } catch (error) {
        const validationError = new Error(ERROR_CODES.VALIDATION_ERROR);
        (validationError as any).details = ['File validation failed'];
        next(validationError);
      }
    };
  }

  /**
   * Sanitize request body
   */
  public static sanitizeBody(fields: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        fields.forEach(field => {
          if (req.body[field] && typeof req.body[field] === 'string') {
            req.body[field] = ValidationUtil.sanitizeString(req.body[field]);
          }
        });
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Validate content type
   */
  public static validateContentType(expectedType: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const contentType = req.get('Content-Type');
      
      if (!contentType || !contentType.includes(expectedType)) {
        const error = new Error(ERROR_CODES.VALIDATION_ERROR);
        (error as any).details = [`Content-Type must be ${expectedType}`];
        return next(error);
      }
      
      next();
    };
  }

  /**
   * Validate request size
   */
  public static validateRequestSize(maxSize: number) {
    return (req: Request, res: Response, next: NextFunction) => {
      const contentLength = req.get('Content-Length');
      
      if (contentLength && parseInt(contentLength) > maxSize) {
        const error = new Error(ERROR_CODES.VALIDATION_ERROR);
        (error as any).details = [`Request size exceeds ${maxSize} bytes`];
        return next(error);
      }
      
      next();
    };
  }

  /**
   * Validate required headers
   */
  public static validateHeaders(requiredHeaders: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const missingHeaders = requiredHeaders.filter(header => !req.get(header));
      
      if (missingHeaders.length > 0) {
        const error = new Error(ERROR_CODES.VALIDATION_ERROR);
        (error as any).details = [`Missing required headers: ${missingHeaders.join(', ')}`];
        return next(error);
      }
      
      next();
    };
  }
}

export default ValidationMiddleware;