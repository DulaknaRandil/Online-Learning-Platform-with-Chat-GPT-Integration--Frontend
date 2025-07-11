'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: ''
  })
  
  const { login } = useAuth()
  const router = useRouter()

  const validateForm = () => {
    let valid = true
    const newErrors = { email: '', password: '' }
    
    // Email validation
    if (!email) {
      newErrors.email = 'Email is required'
      valid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
      valid = false
    }
    
    // Password validation
    if (!password) {
      newErrors.password = 'Password is required'
      valid = false
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
      valid = false
    }
    
    setFormErrors(newErrors)
    return valid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)

    try {
      // For testing, show what we're submitting
      console.log('Attempting login with the following credentials:', { 
        email, 
        password: '********',
        passwordLength: password.length,
        endpoint: `/auth/login`
      });
      
      // Note: test accounts use specific passwords (Admin123!, Teach123!, Learn123!)
      await login({ email, password })
      console.log('Login successful, redirecting...');
      router.push('/')
    } catch (err) {
      console.error('Login error in component:', err);
      let errorMsg = 'Login failed';
      
      if (err instanceof Error) {
        errorMsg = err.message;
        
        // Add Network Error handling
        if (errorMsg.includes('Network Error')) {
          errorMsg = 'Unable to connect to the server. Please check your internet connection or try again later.';
        }
        // Enhance error messages for better UX
        else if (errorMsg.includes('Invalid credentials')) {
          errorMsg = 'Invalid email or password. Please try again.';
        } else if (errorMsg.includes('locked')) {
          errorMsg = 'Your account is temporarily locked due to too many failed attempts. Please try again later.';
        }
      }
      
      setError(errorMsg);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
              Register here
            </Link>
          </p>
        </div>
        
        <Card className="border-blue-100 overflow-hidden relative">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600 rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-blue-400 rounded-full opacity-10 blur-3xl"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 backdrop-blur-sm border border-red-200 rounded-xl p-4 animate-pulse">
                  <div className="text-sm text-red-800 font-medium">{error}</div>
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formErrors.email) {
                      setFormErrors({...formErrors, email: ''});
                    }
                  }}
                  className={`mt-1 transition-all rounded-xl backdrop-blur-sm ${formErrors.email ? 'border-red-400 bg-red-50' : 'focus:border-blue-400 hover:border-blue-300'}`}
                  placeholder="Enter your email"
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-500 text-xs">●</span> {formErrors.email}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="relative group">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (formErrors.password) {
                          setFormErrors({...formErrors, password: ''});
                        }
                      }}
                      className={`transition-all rounded-xl backdrop-blur-sm pr-10 ${formErrors.password ? 'border-red-400 bg-red-50' : 'focus:border-blue-400 hover:border-blue-300'}`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-500 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <div className="p-1 rounded-full hover:bg-blue-100 transition-all">
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </div>
                    </button>
                    <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-300 pointer-events-none transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                  </div>
                </div>
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-500 text-xs">●</span> {formErrors.password}
                  </p>
                )}
              </div>
              
              <div className="mt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full font-semibold py-6 relative overflow-hidden group"
                  size="lg"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  
                  {isLoading ? (
                    <div className="flex items-center justify-center relative z-10">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-base">Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center relative z-10">
                      <LogIn className="h-5 w-5 mr-3" />
                      <span className="text-base">Sign in</span>
                    </div>
                  )}
                  
                  <span className="absolute bottom-0 left-0 h-1 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                </Button>
              </div>
              
              <div className="mt-3 text-center">
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-all">
                  Forgot your password?
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
