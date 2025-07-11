'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthResponse, LoginCredentials, RegisterCredentials } from '@/types'
import api from '@/lib/api'
import axios from 'axios'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        // Verify token is still valid
        api.get('/auth/me')
          .then(response => {
            const userFromServer = response.data.data?.user || response.data.user
            if (userFromServer) {
              setUser(userFromServer)
              // Update stored user data
              localStorage.setItem('user', JSON.stringify(userFromServer))
            }
          })
          .catch((error) => {
            console.error('Token validation failed:', error)
            // Only log out if it's a 401 error
            if (axios.isAxiosError(error) && error.response?.status === 401) {
              localStorage.removeItem('authToken')
              localStorage.removeItem('user')
              setUser(null)
            }
          })
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('Making login request to API:', {
        url: '/auth/login',
        email: credentials.email,
        passwordProvided: !!credentials.password,
        passwordLength: credentials.password?.length || 0
      });
      
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      console.log('Login API response:', response.data);
      
      // Standard API response format with data property
      if (response.data && response.data.data) {
        const { accessToken, user } = response.data.data;
        
        if (!accessToken || !user) {
          console.error('Missing token or user in response data:', response.data);
          throw new Error('Invalid response format from server');
        }
        
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        console.log('User authenticated successfully:', user.email);
        return;
      } 
      
      // Try different response formats
      console.log('Trying alternative response formats');
      
      // Direct properties in response
      if (response.data.accessToken && response.data.user) {
        localStorage.setItem('authToken', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        console.log('User authenticated successfully (direct format)');
        return;
      }
      
      // Token instead of accessToken
      if (response.data.token && response.data.user) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        console.log('User authenticated successfully (token format)');
        return;
      }
      
      console.error('Unrecognized API response format:', response.data);
      throw new Error('Could not extract authentication data from server response');
    } catch (error: unknown) {
      console.error('Login error details:', error);
      if (axios.isAxiosError(error)) {
        console.error('API error response:', error.response?.data || error.message);
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        } else if (error.message) {
          throw new Error(error.message);
        }
      }
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please check your credentials and try again.';
      throw new Error(errorMessage);
    }
  }

  const register = async (credentials: RegisterCredentials) => {
    try {
      // Transform frontend data to backend format
      const backendData = {
        username: credentials.username || `${credentials.firstName} ${credentials.lastName}`, // Use provided username or combine firstName + lastName
        name: `${credentials.firstName} ${credentials.lastName}`, // Add full name field
        email: credentials.email,
        password: credentials.password,
        role: credentials.role || 'student' // Default to student if role not provided
      };
      
      console.log('Making registration request to API', { 
        email: backendData.email,
        username: backendData.username,
        name: backendData.name,
        role: backendData.role 
      });
      
      const response = await api.post<AuthResponse>('/auth/register', backendData);
      console.log('Registration API response:', response.data);
      
      // Standard API response format with data property (our expected format)
      if (response.data.success && response.data.data) {
        const { accessToken, user } = response.data.data;
        
        if (!accessToken || !user) {
          console.error('Missing token or user in response data:', response.data);
          throw new Error('Invalid response format from server');
        }
        
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        console.log('User registered successfully:', user.email);
        return;
      }
      
      // Alternative formats - try different response structures
      let token = null;
      let user = null;
      let dataField = null;
      
      // Check if response data has a data field
      if (response.data.data) {
        dataField = response.data.data;
      } else {
        dataField = response.data; // Use response.data directly if no data field
      }
      
      // Try to extract token (could be named accessToken or token)
      if (dataField.accessToken) {
        token = dataField.accessToken;
      } else if (dataField.token) {
        token = dataField.token;
      } else if (response.data.accessToken) {
        token = response.data.accessToken;
      } else if (response.data.token) {
        token = response.data.token;
      }
      
      // Try to extract user
      if (dataField.user) {
        user = dataField.user;
      } else if (response.data.user) {
        user = response.data.user;
      }
      
      if (token && user) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        console.log('User registered successfully (alternative format):', user.email);
        return;
      }
      
      console.error('Unrecognized API response format:', response.data);
      throw new Error('Invalid response format from server');
    } catch (error: unknown) {
      console.error('Registration error:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('API error response:', error.response.data);
        const serverMessage = error.response.data?.message || error.response.data?.error || 'Server error';
        throw new Error(serverMessage);
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.'
        throw new Error(errorMessage)
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setUser(null)
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
