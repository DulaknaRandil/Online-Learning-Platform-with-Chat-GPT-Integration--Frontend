import axios from 'axios'

// Log the environment variable for debugging
console.log('API URL from env:', process.env.NEXT_PUBLIC_API_URL);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Log what we're actually using
console.log('Using API URL:', API_URL);

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Changed to false for simpler CORS handling
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('API request to:', config.url, 'with baseURL:', config.baseURL);
    
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('API request error:', error);
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the full error for debugging
    console.error('API Error Details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
      method: error.config?.method
    });
    
    // Handle specific error cases
    if (error.response) {
      // Server returned an error response
      const errorData = error.response.data;
      let errorMessage = 'An error occurred';
      
      // Extract error message from various response formats
      if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }
      
      switch (error.response.status) {
        case 400:
          // Bad request - usually validation errors
          if (errorData?.errors) {
            const validationErrors = errorData.errors;
            if (Array.isArray(validationErrors)) {
              errorMessage = validationErrors.map((err: string | { field?: string; message?: string }) => 
                typeof err === 'string' ? err : err.message || err.field || 'Validation error'
              ).join(', ');
            }
          }
          return Promise.reject(new Error(errorMessage))
          
        case 401:
          // Don't log out on login/register pages failed auth
          if (!window.location.pathname.includes('/auth/')) {
            localStorage.removeItem('authToken')
            localStorage.removeItem('user')
            // Only redirect if not already on the login page
            if (!window.location.pathname.includes('/auth/login')) {
              window.location.href = '/auth/login'
            }
          }
          return Promise.reject(new Error(errorMessage || 'Authentication required. Please log in.'))
        
        case 403:
          return Promise.reject(new Error(errorMessage || 'You do not have permission to access this resource.'))
          
        case 404:
          return Promise.reject(new Error(errorMessage || 'Resource not found.'))
          
        case 429:
          return Promise.reject(new Error(errorMessage || 'Too many attempts. Please try again later.'))
          
        case 422:
          // Validation errors
          if (errorData?.errors && Array.isArray(errorData.errors)) {
            const validationErrors = errorData.errors;
            const errorMessages = validationErrors.map((err: string | { field?: string; message?: string }) => {
              if (typeof err === 'string') return err;
              if (err.field && err.message) return `${err.field}: ${err.message}`;
              return err.message || 'Validation error';
            });
            errorMessage = errorMessages.join(', ');
          }
          return Promise.reject(new Error(errorMessage || 'Validation error. Please check your input.'))
          
        case 500:
          return Promise.reject(new Error(errorMessage || 'Internal server error. Please try again later.'))
          
        default:
          return Promise.reject(new Error(errorMessage || 'An unexpected error occurred. Please try again.'))
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network Error:', error.request)
      return Promise.reject(new Error('Network error. Please check your connection and try again.'))
    } else {
      // Error in setting up the request
      console.error('Request Error:', error.message)
      return Promise.reject(new Error(error.message || 'Request setup error'))
    }
  }
)

export default api
