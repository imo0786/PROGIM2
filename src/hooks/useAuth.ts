import { useState, useEffect } from 'react';
import { authService } from '@/lib/auth';

interface User {
  username: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = authService.isAuthenticated();
      if (isAuthenticated) {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (username: string, password: string): boolean => {
    const success = authService.login(username, password);
    if (success) {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
    }
    return success;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };
};