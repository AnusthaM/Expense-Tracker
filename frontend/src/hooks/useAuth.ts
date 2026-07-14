import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../lib/api';
import type { UserDto, RegisterRequest } from '../types';

/**
 * Centralized authentication hook.
 * JWT is stored in httpOnly cookie (not localStorage).
 * Only non-sensitive user info is cached in localStorage.
 */
export function useAuth() {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Verify session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try cached user first for instant UI
        const cached = localStorage.getItem('user');
        if (cached) {
          setUser(JSON.parse(cached));
        }
        // Verify with backend (uses httpOnly cookie)
        const currentUser = await apiClient.getCurrentUser();
        setUser(currentUser);
        localStorage.setItem('user', JSON.stringify(currentUser));
      } catch {
        // Session expired or invalid
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const userData = await apiClient.login(email, password);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      navigate('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const register = useCallback(async (data: RegisterRequest) => {
    setError(null);
    setLoading(true);
    try {
      const userData = await apiClient.register(data);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      navigate('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      await apiClient.logout(); // Clears httpOnly cookie
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem('user');
    setUser(null);
    navigate('/auth');
  }, [navigate]);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    setError
  };
}