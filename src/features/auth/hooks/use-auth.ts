import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AuthService } from '../services/auth.service';
import { TokenManager } from '../../../infrastructure/auth/token-manager';
import type { User, AuthState, LoginCredentials, RegisterData } from '../../../shared/types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const isAuthenticated = !!user;
  const isAdmin = user?.roles.includes('admin') ?? false;
  const isApplicant = user?.roles.includes('applicant') ?? false;

  // Get current user on mount
  const {
    data: currentUser,
    isLoading: userLoading,
    error: userError,
  } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => AuthService.getCurrentUser(),
    enabled: !!TokenManager.getAccessToken(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: AuthService.login,
    onSuccess: (data: any) => {
      setUser(data.user);
      queryClient.setQueryData(['auth', 'user'], data.user);
    },
    onError: (error: any) => {
      console.error('Login failed:', error);
      TokenManager.clearTokens();
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: AuthService.register,
    onSuccess: (data: any) => {
      setUser(data.user);
      queryClient.setQueryData(['auth', 'user'], data.user);
    },
    onError: (error: any) => {
      console.error('Registration failed:', error);
      TokenManager.clearTokens();
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: AuthService.logout,
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
      window.location.href = '/login';
    },
  });

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    } else if (userError || !TokenManager.getAccessToken()) {
      setUser(null);
    }
    setIsLoading(userLoading);
  }, [currentUser, userError, userLoading]);

  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  };

  const register = async (data: RegisterData) => {
    await registerMutation.mutateAsync(data);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const refreshUser = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      setUser(user);
      queryClient.setQueryData(['auth', 'user'], user);
    } catch (error: any) {
      console.error('Failed to refresh user:', error);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    isApplicant,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Auth guard hook for protected routes
export function useAuthGuard(requiredRole?: 'admin' | 'applicant') {
  const { isAuthenticated, isLoading, isAdmin, isApplicant } = useAuth();

  const hasAccess = isAuthenticated && (
    !requiredRole ||
    (requiredRole === 'admin' && isAdmin) ||
    (requiredRole === 'applicant' && isApplicant)
  );

  return {
    isLoading,
    isAuthenticated,
    hasAccess,
    isAdmin,
    isApplicant,
  };
}
