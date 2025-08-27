export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  address?: string;
  phone_number?: string;
  role?: string;
}

export interface UserProfile {
  user: User;               // nested
  profile_picture?: string | null;
  date_of_birth?: string | null;
  preferences?: Record<string, any>;
}

export interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export interface UpdateProfilePayload {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  address?: string;
  phone_number?: string;

  // optional fields from nested UserProfile
  profile_picture?: File | null;  // optional image
  date_of_birth?: string | null;  // optional date
  preferences?: Record<string, any>; // optional preferences object
}

