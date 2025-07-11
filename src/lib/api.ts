import axios from 'axios'

// Get API URL from environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Always log environment info for debugging
console.log('=== API CONFIGURATION DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_API_URL from env:', process.env.NEXT_PUBLIC_API_URL);
console.log('Final API_URL being used:', API_URL);
console.log('================================');

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
    
    // Log request data for debugging
    if (config.method === 'post' || config.method === 'put') {
      console.log('Request data:', config.data);
      
      // If we're creating a course, add extra logs
      if (config.url?.includes('/courses')) {
        console.log('COURSE REQUEST - Detailed data analysis:');
        try {
          const data = JSON.parse(JSON.stringify(config.data));
          
          // Check for required fields
          const requiredFields = ['title', 'description', 'category', 'difficulty', 'language', 'duration'];
          const missingFields = requiredFields.filter(field => !data[field]);
          if (missingFields.length > 0) {
            console.warn('Missing required fields:', missingFields);
          }
          
          // Check data types
          Object.keys(data).forEach(key => {
            console.log(`Field: ${key}, Type: ${typeof data[key]}, Value:`, 
              Array.isArray(data[key]) ? `Array[${data[key].length}]` : data[key]);
          });
        } catch (err) {
          console.error('Error parsing request data:', err);
        }
      }
    }
    
    const token = localStorage.getItem('authToken')
    if (token) {
      // Make sure the Authorization header is properly set with Bearer prefix
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      
      // Log token for debugging (masked for security)
      console.log(`Token present: ${token.substring(0, 10)}...`);
    } else {
      console.log('No auth token available for request');
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
  (response) => {
    // Log detailed success responses for direct endpoints
    if (response.config.url?.includes('direct-')) {
      console.log(`✅ DIRECT API SUCCESS [${response.config.method?.toUpperCase()}] ${response.config.url}:`, {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
    }
    return response;
  },
  (error) => {
    // Enhanced error logging
    const isDirectEndpoint = error.config?.url?.includes('direct-');
    
    console.error(`❌ API ${isDirectEndpoint ? 'DIRECT ' : ''}ERROR [${error.config?.method?.toUpperCase() || 'UNKNOWN'}] ${error.config?.url || 'unknown'}:`, error);
    
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
      console.error('Network Error:', error.request);
      
      // Check if we have a connection to the server
      const checkServerHealth = async () => {
        try {
          // Use the same API_URL that was configured at the top
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/health`);
          return true;
        } catch {
          return false;
        }
      };
      
      // If server health check fails, the server might be down
      checkServerHealth().then(isServerUp => {
        if (!isServerUp) {
          console.error('Backend server appears to be down');
        }
      });
      
      return Promise.reject(new Error('Network error. Please check your connection and try again.'));
    } else {
      // Error in setting up the request
      console.error('Request Error:', error.message);
      return Promise.reject(new Error(error.message || 'Request setup error'));
    }
  }
)

export default api
