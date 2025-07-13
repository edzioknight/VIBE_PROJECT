// This file augments the Express Request type to include custom properties.

declare namespace Express {
  export interface Request {
    user?: {
      userId: string;
      email: string;
      isTemp?: boolean;
    };
    // Properties added by middleware in app.ts
    requestId?: string;
    rawBody?: Buffer;
  }
}