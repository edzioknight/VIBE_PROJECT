export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string[];
  };
  meta?: {
    pagination?: {
      cursor: string;
      hasMore: boolean;
    };
  };
}