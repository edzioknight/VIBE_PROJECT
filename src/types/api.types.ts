@@ .. @@
 export interface PaginationMeta {
   cursor?: string;
   hasMore: boolean;
   total?: number;
 }
 
-export interface RequestWithUser extends Request {
-  user?: {
-    userId: string;
-    email: string;
-    isTemp?: boolean;
-  };
-}
-
 export interface DeviceInfo {
   platform?: string;
   version?: string;