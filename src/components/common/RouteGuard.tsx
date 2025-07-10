'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface RouteGuardProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'instructor' | 'student' | string[];
  redirectTo?: string;
}

/**
 * RouteGuard component that protects routes based on user authentication and role
 * 
 * @param children - The content to render if user has access
 * @param requiredRole - The role(s) required to access this route
 * @param redirectTo - Optional redirect path (defaults to role-specific paths)
 */
export function RouteGuard({ 
  children, 
  requiredRole, 
  redirectTo 
}: RouteGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  
  useEffect(() => {
    // Authentication check
    if (isLoading) return; // Wait for auth check to complete
    
    // If no required role, just check if user is authenticated
    if (!requiredRole) {
      if (!user) {
        router.push(redirectTo || '/auth/login');
      } else {
        setAuthorized(true);
      }
      return;
    }
    
    // Handle case where user is not authenticated
    if (!user) {
      router.push(redirectTo || '/auth/login');
      return;
    }
    
    // Check if user has required role
    const checkRole = () => {
      if (Array.isArray(requiredRole)) {
        return requiredRole.includes(user.role);
      }
      return user.role === requiredRole;
    };
    
    if (checkRole()) {
      setAuthorized(true);
    } else {
      // Redirect based on user role
      let path = redirectTo || '/';
      if (!redirectTo) {
        switch (user.role) {
          case 'admin':
            path = '/admin/dashboard';
            break;
          case 'instructor':
            path = '/instructor/dashboard';
            break;
          case 'student':
            path = '/student/dashboard';
            break;
          default:
            path = '/';
        }
      }
      router.push(path);
    }
  }, [user, requiredRole, router, redirectTo, isLoading]);
  
  // Show loading state
  if (isLoading || !authorized) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }
  
  // Render children once authorized
  return <>{children}</>;
}

export default RouteGuard;
