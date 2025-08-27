// src/redux/features/auth/types.ts
export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  address?: string;
}

export interface AuthState {
  accessToken: string | null;
  user: User | null; // <-- add this
  loading: boolean;
  error: string | null;
}


export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  address?: string;
  password: string;
  password_confirm: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}
