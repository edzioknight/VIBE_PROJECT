import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.config';
import { ErrorResponse } from '../types/api.types';
import { ERROR_CODES, HTTP_STATUS } from '../utils/constants';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: string[];
}

export class ErrorHandlerMiddleware {
  /**
   * Global error handler middleware
   */
  public static handle(error: AppError, req: Request, res: Response, next: NextFunction): void {
    // Log the error
    logger.error('Request error', {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.userId,
    });

    // Determine error details
    const errorResponse = ErrorHandlerMiddleware.formatError(error);
    
    // Send error response
    res.status(errorResponse.statusCode).json({
      success: false,
      error: {
        code: errorResponse.code,
        message: errorResponse.message,
        details: errorResponse.details,
      },
    } as ErrorResponse);
  }

  /**
   * Format error for response
   */
  private static formatError(error: AppError): {
    statusCode: number;
    code: string;
    message: string;
    details?: string[];
  } {
    // Handle known error codes
    switch (error.message) {
      case ERROR_CODES.VALIDATION_ERROR:
        return {
          statusCode: HTTP_STATUS.BAD_REQUEST,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid input data',
          details: error.details,
        };

      case ERROR_CODES.RATE_LIMIT_EXCEEDED:
        return {
          statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
          code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
          message: 'Too many requests. Please try again later.',
        };

      case ERROR_CODES.INVALID_OTP:
        return {
          statusCode: HTTP_STATUS.BAD_REQUEST,
          code: ERROR_CODES.INVALID_OTP,
          message: 'Invalid or expired OTP code',
        };

      case ERROR_CODES.OTP_EXPIRED:
        return {
          statusCode: HTTP_STATUS.BAD_REQUEST,
          code: ERROR_CODES.OTP_EXPIRED,
          message: 'OTP code has expired',
        };

      case ERROR_CODES.OTP_MAX_ATTEMPTS:
        return {
          statusCode: HTTP_STATUS.BAD_REQUEST,
          code: ERROR_CODES.OTP_MAX_ATTEMPTS,
          message: 'Maximum OTP attempts exceeded',
        };

      case ERROR_CODES.USER_NOT_FOUND:
        return {
          statusCode: HTTP_STATUS.NOT_FOUND,
          code: ERROR_CODES.USER_NOT_FOUND,
          message: 'User not found',
        };

      case ERROR_CODES.INVALID_TOKEN:
        return {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          code: ERROR_CODES.INVALID_TOKEN,
          message: 'Invalid or malformed token',
        };

      case ERROR_CODES.TOKEN_EXPIRED:
        return {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          code: ERROR_CODES.TOKEN_EXPIRED,
          message: 'Token has expired',
        };

      case ERROR_CODES.TOKEN_REVOKED:
        return {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          code: ERROR_CODES.TOKEN_REVOKED,
          message: 'Token has been revoked',
        };

      case ERROR_CODES.UNAUTHORIZED:
        return {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'Authentication required',
        };

      case ERROR_CODES.FORBIDDEN:
        return {
          statusCode: HTTP_STATUS.FORBIDDEN,
          code: ERROR_CODES.FORBIDDEN,
          message: 'Access denied',
        };

      case ERROR_CODES.DUPLICATE_EMAIL:
        return {
          statusCode: HTTP_STATUS.CONFLICT,
          code: ERROR_CODES.DUPLICATE_EMAIL,
          message: 'Email address is already registered',
        };

      case ERROR_CODES.UPLOAD_ERROR:
        return {
          statusCode: HTTP_STATUS.BAD_REQUEST,
          code: ERROR_CODES.UPLOAD_ERROR,
          message: 'File upload failed',
          details: error.details,
        };

      case ERROR_CODES.INVALID_FILE_TYPE:
        return {
          statusCode: HTTP_STATUS.BAD_REQUEST,
          code: ERROR_CODES.INVALID_FILE_TYPE,
          message: 'Invalid file type',
        };

      case ERROR_CODES.FILE_TOO_LARGE:
        return {
          statusCode: HTTP_STATUS.BAD_REQUEST,
          code: ERROR_CODES.FILE_TOO_LARGE,
          message: 'File size exceeds limit',
        };

      case ERROR_CODES.GOOGLE_AUTH_FAILED:
        return {
          statusCode: HTTP_STATUS.BAD_REQUEST,
          code: ERROR_CODES.GOOGLE_AUTH_FAILED,
          message: 'Google authentication failed',
        };

      case ERROR_CODES.EMAIL_SEND_FAILED:
        return {
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          code: ERROR_CODES.EMAIL_SEND_FAILED,
          message: 'Failed to send email',
        };

      case ERROR_CODES.ONBOARDING_INCOMPLETE:
        return {
          statusCode: HTTP_STATUS.FORBIDDEN,
          code: ERROR_CODES.ONBOARDING_INCOMPLETE,
          message: 'Please complete your profile setup',
        };

      case ERROR_CODES.PROFILE_UPDATE_FAILED:
        return {
          statusCode: HTTP_STATUS.BAD_REQUEST,
          code: ERROR_CODES.PROFILE_UPDATE_FAILED,
          message: 'Failed to update profile',
        };

      default:
        // Handle validation errors that start with "Validation failed:"
        if (error.message.startsWith('Validation failed:')) {
          return {
            statusCode: HTTP_STATUS.BAD_REQUEST,
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Invalid input data',
            details: [error.message.replace('Validation failed: ', '')],
          };
        }

        // Handle query validation errors
        if (error.message.startsWith('Query validation failed:')) {
          return {
            statusCode: HTTP_STATUS.BAD_REQUEST,
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Invalid query parameters',
            details: [error.message.replace('Query validation failed: ', '')],
          };
        }

        // Handle parameter validation errors
        if (error.message.startsWith('Parameter validation failed:')) {
          return {
            statusCode: HTTP_STATUS.BAD_REQUEST,
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Invalid URL parameters',
            details: [error.message.replace('Parameter validation failed: ', '')],
          };
        }

        // Handle multer errors
        if (error.message.includes('File too large')) {
          return {
            statusCode: HTTP_STATUS.BAD_REQUEST,
            code: ERROR_CODES.FILE_TOO_LARGE,
            message: 'File size exceeds limit',
          };
        }

        if (error.message.includes('Invalid file type')) {
          return {
            statusCode: HTTP_STATUS.BAD_REQUEST,
            code: ERROR_CODES.INVALID_FILE_TYPE,
            message: 'Invalid file type',
          };
        }

        // Default internal server error
        return {
          statusCode: error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
          code: error.code || ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : error.message || 'Something went wrong',
        };
    }
  }

  /**
   * Handle 404 errors
   */
  public static notFound(req: Request, res: Response): void {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${req.method} ${req.path} not found`,
      },
    } as ErrorResponse);
  }

  /**
   * Async error wrapper
   */
  public static asyncHandler(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Create custom error
   */
  public static createError(
    message: string, 
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code?: string,
    details?: string[]
  ): AppError {
    const error = new Error(message) as AppError;
    error.statusCode = statusCode;
    error.code = code;
    error.details = details;
    return error;
  }
}

export default ErrorHandlerMiddleware;