@@ .. @@
 import { AuthService } from '../services/auth.service';
 import { TokenService } from '../services/token.service';
 import { logger } from '../config/logger.config';
-import { ApiResponse } from '../types/api.types';
+import { ApiResponse, ErrorResponse } from '../types/api.types';
 import { 
   OtpRequest, 
   OtpVerification, 
   GoogleSignInRequest, 
   TokenRefreshRequest 
 } from '../types/auth.types';
-import { RequestWithUser } from '../types/api.types';
 
 export class AuthController {
   /**
@@ .. @@
   /**
    * Logout user
    */
 }
-  public static async logout(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
}
+  public static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
       const refreshToken = req.body.refreshToken;
       const userId = req.user!.userId;
     }
}
@@ .. @@
   /**
    * Get authentication status
    */
-  public static async getAuthStatus(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
}
+  public static async getAuthStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
       const userId = req.user!.userId;
       const activeTokensCount = await TokenService.getUserActiveTokensCount(userId);
     }
}
@@ .. @@
   /**
    * Revoke all user tokens (logout from all devices)
    */
-  public static async revokeAllTokens(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
}
+  public static async revokeAllTokens(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
       const userId = req.user!.userId;
       await TokenService.revokeAllUserTokens(userId);
     }
}
@@ .. @@
   /**
    * Validate token endpoint (for debugging)
    */
-  public static async validateToken(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
}
+  public static async validateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
       const authHeader = req.get('Authorization');
       const token = authHeader?.split(' ')[1];
     }
}