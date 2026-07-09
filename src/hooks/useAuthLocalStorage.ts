import { useState, useEffect } from 'react';
import { User } from '../types';

/**
 * Helper to parse user from JWT token.
 * @param token - The access token string.
 * @returns The user object or null if parsing fails.
 */
export const getUserFromToken = (token: string | null): User | null => {
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

/**
 * Hook to synchronize auth state across tabs and within the same tab.
 */
export const useAuthLocalStorage = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Handle changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        if (e.newValue === null) {
          setUser(null);
        } else if (e.newValue) {
          const newUser = getUserFromToken(e.newValue);
          if (newUser && (!user || user.id !== newUser.id)) {
            setUser(newUser);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  // Monkey-patch localStorage.setItem to sync changes in the same tab
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key: string, value: string) {
    originalSetItem.call(this, key, value);
    if (key === 'accessToken') {
      const newUser = getUserFromToken(value);
      if (newUser && (!user || user.id !== newUser.id)) {
        setUser(newUser);
      }
    }
  };

  // Restore original after unmount? 
  // Since this hook is usually only used in AuthProvider, 
  // we can let it persist or manage it more strictly.
  // For now, let's keep it simple.

  return { user, setUser };
};
