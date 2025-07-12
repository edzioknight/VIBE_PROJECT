export interface ApiResponse<T = any> {
  success: true;
  data: T;
  meta?: {
    pagination?: {
      cursor?: string;
      hasMore?: boolean;
      total?: number;
    };
    [key: string]: any;
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string[];
  };
}

export type ApiResult<T = any> = ApiResponse<T> | ErrorResponse;

export interface PaginationParams {
  limit?: number;
  cursor?: string;
}

export interface PaginationMeta {
  cursor?: string;
  hasMore: boolean;
  total?: number;
}

export interface RequestWithUser extends Request {
  user?: {
    userId: string;
    email: string;
    isTemp?: boolean;
  };
}

export interface DeviceInfo {
  platform?: string;
  version?: string;
  model?: string;
  userAgent?: string;
}

export interface SessionInfo {
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: DeviceInfo;
}