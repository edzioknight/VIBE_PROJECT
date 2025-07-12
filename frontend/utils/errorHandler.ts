export const handleAPIError = (error: any) => {
  if (error.code === 'NETWORK_ERROR') {
    return 'Network connection failed. Please check your internet connection.';
  }
  
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    return 'Too many requests. Please wait a moment before trying again.';
  }
  
  if (error.code === 'INVALID_TOKEN') {
    return 'Session expired. Please sign in again.';
  }
  
  if (error.code === 'VALIDATION_ERROR') {
    return error.message || 'Please check your input and try again.';
  }
  
  if (error.code === 'UNAUTHORIZED') {
    return 'Authentication failed. Please sign in again.';
  }
  
  if (error.code === 'FORBIDDEN') {
    return 'You do not have permission to perform this action.';
  }
  
  if (error.code === 'NOT_FOUND') {
    return 'The requested resource was not found.';
  }
  
  if (error.code === 'CONFLICT') {
    return 'This action conflicts with existing data.';
  }
  
  return error.message || 'An unexpected error occurred.';
};