import { useState, useEffect, useCallback } from 'react';
import { authAPI, isTokenExpiringSoon } from '../services/api';
import { User, LoginRequest, LoginResponse, ApiResponse } from '../types';
import { useAuthLocalStorage } from './useAuthLocalStorage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<string | null>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user, setUser } = useAuthLocalStorage();
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const clearAuth = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  }, [setUser]);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    const token = localStorage.getItem('accessToken');
    if (token && !isTokenExpiringSoon(token)) {
      return token;
    }
    return null;
  }, []);

  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(credentials);
      const { user: userData, access_token, refresh_token } = response.data;

      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      setUser(userData);
    } catch (error: any) {
      console.error('Login failed:', error);
      clearAuth();
      throw new Error(error.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }, [clearAuth, setUser]);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      clearAuth();
      window.location.href = '/';
    }
  }, [clearAuth]);

  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const userData = getUserFromToken(token);
        if (userData) {
          setUser(userData);
        } else {
          clearAuth();
        }
      } else {
        clearAuth();
      }
      setIsLoading(false);
    };

    initAuth();
  }, [clearAuth, setUser]);

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export type { AuthContextType };
