'use client'

import { ReactNode } from 'react'
import Navigation from './Navigation'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toast'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
          {/* Glass UI background elements */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute top-1/4 -left-20 w-60 h-60 bg-purple-500 rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute -bottom-40 right-1/4 w-72 h-72 bg-blue-400 rounded-full opacity-10 blur-3xl"></div>
          
          <Navigation />
          <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="relative z-10 bg-white bg-opacity-70 backdrop-blur-sm border-t mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center text-gray-600">
                <p>&copy; 2025 EduPlatform. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
        <Toaster />
      </ToastProvider>
    </AuthProvider>
  )
}

export default Layout
