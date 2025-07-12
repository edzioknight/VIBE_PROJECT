export interface UserProfile {
  id: string;
  email: string;
  name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'non-binary';
  country: string;
  state?: string;
  city?: string;
  bio?: string;
  profile_photos: string[];
  
  // Lifestyle
  exercise?: string;
  education?: string;
  job?: string;
  drinking?: string;
  smoking?: string;
  kids?: string;
  ethnicity?: string;
  religion?: string;
  
  // Preferences
  relationship_type?: string;
  current_status?: string;
  sexuality?: string;
  looking_for?: string;
  preferences: string[];
  preferred_genders: string[];
  
  // Personality
  mbti?: string;
  interests: string[];
  
  // Settings
  allow_search: boolean;
  show_activity_status: boolean;
  theme: 'light' | 'dark' | 'system';
  
  // Status
  is_premium: boolean;
  premium_expires_at?: string;
  is_verified: boolean;
  onboarding_completed: boolean;
  last_active: string;
  created_at: string;
}