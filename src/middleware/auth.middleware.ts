@@ .. @@
 import { Request, Response, NextFunction } from 'express';
 import { TokenService } from '../services/token.service';
 import { UserService } from '../services/user.service';
 import { JwtUtil } from '../utils/jwt.util';
 import { logger } from '../config/logger.config';
 import { ERROR_CODES } from '../utils/constants';
-import { RequestWithUser } from '../types/api.types';
 
 export class AuthMiddleware {
   /**
    * Authenticate access token
    */
 }
-  public static async authenticateToken(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
}
+  public static async authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
       const authHeader = req.get('Authorization');
       const token = JwtUtil.extractTokenFromHeader(authHeader);
     }
}
@@ .. @@
   /**
    * Authenticate temporary token (for signup process)
    */
-  public static async authenticateTempToken(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
}
+  public static async authenticateTempToken(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
       const authHeader = req.get('Authorization');
       const token = JwtUtil.extractTokenFromHeader(authHeader);
     }
}
@@ .. @@
   /**
    * Optional authentication (doesn't fail if no token)
    */
-  public static async optionalAuth(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
}
+  public static async optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
       const authHeader = req.get('Authorization');
       const token = JwtUtil.extractTokenFromHeader(authHeader);
     }
}
@@ .. @@
   /**
    * Require completed onboarding
    */
-  public static async requireOnboarding(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
}
+  public static async requireOnboarding(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
       if (!req.user) {
         const error = new Error(ERROR_CODES.UNAUTHORIZED);
       }
     }
}
@@ .. @@
   /**
    * Require premium subscription
    */
-  public static async requirePremium(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
}
+  public static async requirePremium(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
       if (!req.user) {
         const error = new Error(ERROR_CODES.UNAUTHORIZED);
       }
     }
}