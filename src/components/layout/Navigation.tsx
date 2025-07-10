'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Home, 
  Search,
  PlusCircle,
  GraduationCap
} from 'lucide-react'
import { useState } from 'react'

const Navigation = () => {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-white bg-opacity-70 backdrop-blur-md shadow-md border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600 rounded-full blur-[2px]"></div>
                <GraduationCap className="h-8 w-8 text-white relative z-10" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">EduPlatform</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link href="/courses" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
              <BookOpen className="h-4 w-4" />
              <span>Courses</span>
            </Link>
            <Link href="/recommendations" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
              <Search className="h-4 w-4" />
              <span>AI Recommendations</span>
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === 'admin' && (
                  <Link href="/admin/dashboard" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
                    <User className="h-4 w-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                {user.role === 'instructor' && (
                  <>
                    <Link href="/instructor/dashboard" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
                      <User className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link href="/instructor/courses/create" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
                      <PlusCircle className="h-4 w-4" />
                      <span>Create Course</span>
                    </Link>
                  </>
                )}
                {user.role === 'student' && (
                  <Link href="/student/dashboard" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
                    <User className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                )}
                <span className="text-sm text-gray-600">
                  Hello, {user.username ? user.username.split(' ')[0] : user.email.split('@')[0]}
                </span>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <Link href="/" className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link href="/courses" className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600">
              <BookOpen className="h-4 w-4" />
              <span>Courses</span>
            </Link>
            <Link href="/recommendations" className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600">
              <Search className="h-4 w-4" />
              <span>AI Recommendations</span>
            </Link>
            
            {user ? (
              <div className="space-y-1">
                {user.role === 'admin' && (
                  <Link href="/admin/dashboard" className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600">
                    <User className="h-4 w-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                {user.role === 'instructor' && (
                  <>
                    <Link href="/instructor/dashboard" className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600">
                      <User className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link href="/instructor/courses/create" className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600">
                      <PlusCircle className="h-4 w-4" />
                      <span>Create Course</span>
                    </Link>
                  </>
                )}
                {user.role === 'student' && (
                  <Link href="/student/dashboard" className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600">
                    <User className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                )}
                <div className="px-3 py-2 text-sm text-gray-600">
                  Hello, {user.username ? user.username.split(' ')[0] : user.email.split('@')[0]}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-red-600 w-full text-left"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link href="/auth/login" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                  Login
                </Link>
                <Link href="/auth/register" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navigation
