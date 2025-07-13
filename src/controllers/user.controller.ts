@@ .. @@
 import UploadConfig from '../config/upload.config';
 import { logger } from '../config/logger.config';
 import { ApiResponse } from '../types/api.types';
-import { RequestWithUser } from '../types/api.types';
 import {
   BasicInfoPayload,
   LocationPayload,
 }
@@ .. @@
   /**
    * Get user profile
    */
-  public static async getProfile(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
}
+  public static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
       const userId = req.user!.userId;
       const userProfile = await UserService.getUserProfile(userId);
     }
}
@@ .. @@
   /**
    * Update user profile
    */
-  public static async updateProfile(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
}
+  public static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
       const userId = req.user!.userId;
       const data: ProfileUpdatePayload = req.body;
     }
}
@@ .. @@
   /**
    * Complete basic info step
    */
-  public static async signupBasicInfo(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
}
+  public static async signupBasicInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
       const userId = req.user!.userId;
       const data: BasicInfoPayload = req.body;
     }
}
@@ .. @@
   /**
    * Complete location step
    */
-  public static async signupLocation(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
}
+  public static async signupLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
       const userId = req.user!.userId;
       const data: LocationPayload = req.body;
     }
}
@@ .. @@
   /**
    * Complete lifestyle step
    */
-  public static async signupLifestyle(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
}
+  public static async signupLifestyle(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
       const userId = req.user!.userId;
       const data: LifestylePayload = req.body;
     }
}
@@ .. @@
   /**
    * Complete preferences step
    */
-  public static async signupPreferences(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
}
+  public static async signupPreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
       const userId = req.user!.userId;
       const data: PreferencesPayload = req.body;
     }
}
@@ .. @@
   /**
    * Complete personality step
    */
-  public static async signupPersonality(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
}
+  public static async signupPersonality(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
       const userId = req.user!.userId;
       const data: PersonalityPayload = req.body;
     }
}
@@ .. @@
   /**
    * Complete photos step (final step)
    */
-  public static async signupPhotos(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
}
+  public static async signupPhotos(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
       const userId = req.user!.userId;
       const files = req.files as Express.Multer.File[];
     }
}
@@ .. @@
   /**
    * Get onboarding status
    */
-  public static async getOnboardingStatus(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
}
+  public static async getOnboardingStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
       const userId = req.user!.userId;
       const isCompleted = await UserService.getOnboardingStatus(userId);
     }
}