import React, {createContext, useContext, useEffect, useState, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {apiService} from '../services/apiService';

interface User {
  id: number;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  total_earnings: number;
  available_balance: number;
  surveys_completed: number;
  is_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        apiService.setAuthToken(token);
        const response = await apiService.get('/auth/profile');
        if (response.success) {
          setUser(response.data.user);
        } else {
          await AsyncStorage.removeItem('access_token');
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      await AsyncStorage.removeItem('access_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.post('/auth/login', {
        email,
        password,
      });

      if (response.success) {
        const {access_token, user: userData} = response.data;
        await AsyncStorage.setItem('access_token', access_token);
        apiService.setAuthToken(access_token);
        setUser(userData);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const response = await apiService.post('/auth/register', userData);

      if (response.success) {
        const {access_token, user: newUser} = response.data;
        await AsyncStorage.setItem('access_token', access_token);
        apiService.setAuthToken(access_token);
        setUser(newUser);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('access_token');
      apiService.setAuthToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({...user, ...userData});
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
