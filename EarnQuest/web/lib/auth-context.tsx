'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiService } from './api-service'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

interface User {
  id: number
  email: string
  phone: string
  first_name: string
  last_name: string
  total_earnings: number
  available_balance: number
  surveys_completed: number
  is_verified: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: any) => Promise<boolean>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = Cookies.get('access_token')
      if (token) {
        apiService.setAuthToken(token)
        const response = await apiService.get('/auth/profile')
        if (response.success) {
          setUser(response.data.user)
        } else {
          Cookies.remove('access_token')
          apiService.setAuthToken(null)
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
      Cookies.remove('access_token')
      apiService.setAuthToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.post('/auth/login', { email, password })
      
      if (response.success) {
        const { access_token, user: userData } = response.data
        Cookies.set('access_token', access_token, { expires: 30 })
        apiService.setAuthToken(access_token)
        setUser(userData)
        toast.success('Welcome back to EarnQuest!')
        return true
      } else {
        toast.error(response.error || 'Login failed')
        return false
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
      return false
    }
  }

  const register = async (userData: any): Promise<boolean> => {
    try {
      const response = await apiService.post('/auth/register', userData)
      
      if (response.success) {
        const { access_token, user: newUser } = response.data
        Cookies.set('access_token', access_token, { expires: 30 })
        apiService.setAuthToken(access_token)
        setUser(newUser)
        toast.success('Welcome to EarnQuest! Start earning today.')
        return true
      } else {
        toast.error(response.error || 'Registration failed')
        return false
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
      return false
    }
  }

  const logout = () => {
    Cookies.remove('access_token')
    apiService.setAuthToken(null)
    setUser(null)
    toast.success('Logged out successfully')
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
