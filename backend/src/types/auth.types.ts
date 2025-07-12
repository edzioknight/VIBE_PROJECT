import { User } from '@prisma/client';

export interface AuthTokenPayload {
  userId: string;
  email: string;
  tokenType: 'access' | 'refresh' | 'temp';
  iat?: number;
  exp?: number;
}

export interface OtpRequest {
  email: string;
}

export interface OtpVerification {
  email: string;
  code: string;
}

export interface GoogleSignInRequest {
  idToken: string;
}

export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface LoginResponse {
  userExists: true;
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface SignupResponse {
  userExists: false;
  tempToken: string;
  message: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  country: string;
  state?: string;
  city?: string;
  bio?: string;
  profilePhotos: string[];
  exercise?: string;
  education?: string;
  job?: string;
  drinking?: string;
  smoking?: string;
  kids?: string;
  ethnicity?: string;
  religion?: string;
  relationshipType?: string;
  currentStatus?: string;
  sexuality?: string;
  lookingFor?: string;
  preferences: string[];
  preferredGenders: string[];
  mbti?: string;
  interests: string[];
  allowSearch: boolean;
  showActivityStatus: boolean;
  theme: string;
  isPremium: boolean;
  premiumExpiresAt?: string;
  isVerified: boolean;
  onboardingCompleted: boolean;
  lastActive: string;
  createdAt: string;
}

export interface GoogleUserInfo {
  email: string;
  name: string;
  googleId: string;
  picture?: string;
}

export interface OtpCodeData {
  id: string;
  email: string;
  code: string;
  expiresAt: Date;
  isUsed: boolean;
  attempts: number;
  createdAt: Date;
}

export interface AuthTokenData {
  id: string;
  userId: string;
  tokenHash: string;
  tokenType: string;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
}

export interface UserSessionData {
  id: string;
  userId: string;
  sessionToken: string;
  deviceInfo?: any;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
  lastActivity: Date;
  createdAt: Date;
}