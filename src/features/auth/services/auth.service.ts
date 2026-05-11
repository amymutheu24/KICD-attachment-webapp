import { apiClient } from '../../../infrastructure/api/client';
import { TokenManager } from '../../../infrastructure/auth/token-manager';
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from '../../../shared/types/auth';

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    
    // Store tokens
    TokenManager.setTokens({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    });

    return response.data;
  }

  static async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
    
    // Store tokens
    TokenManager.setTokens({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    });

    return response.data;
  }

  static async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout');
    } finally {
      TokenManager.clearTokens();
    }
  }

  static async refreshToken(): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/refresh');
    
    TokenManager.setTokens({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    });

    return response.data;
  }

  static async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/api/auth/me');
    return response.data;
  }

  static async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>('/api/auth/profile', data);
    return response.data;
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/api/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  static async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/api/auth/forgot-password', { email });
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/api/auth/reset-password', {
      token,
      newPassword,
    });
  }

  static async verifyEmail(token: string): Promise<void> {
    await apiClient.post('/api/auth/verify-email', { token });
  }
}
