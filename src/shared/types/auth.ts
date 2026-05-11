export type AppRole = 'admin' | 'applicant';

export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatar?: string;
  roles: AppRole[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isApplicant: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}
