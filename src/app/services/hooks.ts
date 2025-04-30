import { useState, useCallback } from 'react';
import { api } from './api';
import { User, CreateUserDto, UpdateUserDto } from './types';

export function useApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.login(email, password);
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreateUser = useCallback(async (userData: CreateUserDto) => {
    setIsLoading(true);
    setError(null);
    try {
      return await api.createUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUpdateUser = useCallback(async (id: number, userData: UpdateUserDto) => {
    setIsLoading(true);
    setError(null);
    try {
      return await api.updateUser(id, userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    login: handleLogin,
    createUser: handleCreateUser,
    updateUser: handleUpdateUser,
    getAllUsers: api.getAllUsers,
    getUserById: api.getUserById,
    deleteUser: api.deleteUser,
    resetPassword: api.resetPassword,
  };
}