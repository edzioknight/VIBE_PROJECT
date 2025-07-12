export interface BasicInfoPayload {
  name: string;
  dateOfBirth: string; // ISO date string
  gender: 'male' | 'female' | 'non-binary';
}

export interface LocationPayload {
  country: string;
  state?: string;
  city?: string;
}

export interface LifestylePayload {
  exercise?: string;
  education?: string;
  job?: string;
  drinking?: string;
  smoking?: string;
  kids?: string;
  ethnicity?: string;
  religion?: string;
}

export interface PreferencesPayload {
  relationshipType?: string;
  currentStatus?: string;
  sexuality?: string;
  lookingFor?: string;
  preferences?: string[];
  preferredGenders?: string[];
}

export interface PersonalityPayload {
  mbti?: string;
  interests?: string[];
}

export interface PhotoUploadPayload {
  photos: Express.Multer.File[];
}

export interface ProfileUpdatePayload {
  name?: string;
  bio?: string;
  mbti?: string;
  interests?: string[];
  allowSearch?: boolean;
  showActivityStatus?: boolean;
  theme?: string;
}

export interface SignupStepResponse {
  message: string;
  nextStep?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: any;
}

export interface UserCreateData {
  email: string;
  googleId?: string;
  name?: string;
}

export interface UserUpdateData {
  name?: string;
  dateOfBirth?: Date;
  gender?: string;
  country?: string;
  state?: string;
  city?: string;
  bio?: string;
  profilePhotos?: string[];
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
  preferences?: string[];
  preferredGenders?: string[];
  mbti?: string;
  interests?: string[];
  allowSearch?: boolean;
  showActivityStatus?: boolean;
  theme?: string;
  onboardingCompleted?: boolean;
  lastActive?: Date;
}

export interface PhotoUploadResult {
  url: string;
  key: string;
  size: number;
  format: string;
}

export interface PhotoValidationResult {
  isValid: boolean;
  errors: string[];
  file?: Express.Multer.File;
}