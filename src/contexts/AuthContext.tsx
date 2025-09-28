import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authAPI, isTokenExpiringSoon } from '../services/api'; // Import your existing API
import { User, LoginRequest, LoginResponse, ApiResponse } from '../types'; // Import your existing types

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<string | null>;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper for parsing user from accessToken
const getUserFromToken = (token: string | null): User | null => {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.user_id,
      name: payload.name || '',
      email: payload.email,
      role: payload.role,
      age: payload.age || 0,
      created_at: payload.created_at || '',
      updated_at: payload.updated_at || '',
    };
  } catch (error) {
    console.error('Error parsing user from token:', error);
    return null;
  }
};

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  const isAuthenticated = !!user;

  // Clear auth data
  const clearAuth = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  }, []);

  // Refresh token function (delegates to interceptor)
  const refreshToken = useCallback(async (): Promise<string | null> => {
    // Let the interceptor handle token refresh
    // This function exists mainly for manual refresh if needed
    const token = localStorage.getItem('accessToken');
    if (token && !isTokenExpiringSoon(token)) {
      return token;
    }
    
    // If token is expired/expiring, the next API call will trigger refresh
    // via interceptor, so we just return null and let that handle it
    return null;
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    setIsLoading(true);
    
    try {
      console.log('Attempting login...');
      
      const response: ApiResponse<LoginResponse> = await authAPI.login(credentials);
      const login_response: LoginResponse = response.data
      const { user: userData, access_token, refresh_token } = login_response;

      // Store tokens
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);

      // Set user
      setUser(userData);

      console.log('Login successful:', userData.email);
    } catch (error: any) {
      console.error('Login failed:', error);
      clearAuth();
      throw new Error(error.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }, [clearAuth]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      console.log('Logging out...');
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      clearAuth();
      // Redirect to home page
      window.location.href = '/';
    }
  }, [clearAuth]);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      console.log('Initializing auth state...');
      
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        // Get user from token (regardless of expiry - interceptor will handle refresh)
        const userData = getUserFromToken(token);
        if (userData) {
          setUser(userData);
          console.log('Auth initialized from token:', userData.email);
        } else {
          clearAuth();
        }
      } else {
        // No tokens, clear everything
        clearAuth();
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, [clearAuth]);

  // Listen for token changes from interceptors
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        if (e.newValue === null) {
          // Access token was removed
          console.log('Access token removed, logging out...');
          setUser(null);
        } else if (e.newValue) {
          // Access token was updated (by interceptor or another tab)
          const newUser = getUserFromToken(e.newValue);
          if (newUser && (!user || user.id !== newUser.id)) {
            console.log('Access token updated, syncing user...');
            setUser(newUser);
          }
        }
      }
    };

    // Also listen for changes made by interceptors in the same tab
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      originalSetItem.call(this, key, value);
      if (key === 'accessToken') {
        const newUser = getUserFromToken(value);
        if (newUser && (!user || user.id !== newUser.id)) {
          setUser(newUser);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      localStorage.setItem = originalSetItem; // Restore original
    };
  }, [user]);

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

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export types for use in other components
export type { AuthContextType };
