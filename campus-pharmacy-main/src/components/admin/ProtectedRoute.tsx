import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Initialize session persistence
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        validateAdminUser(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });

    // Check initial session
    checkAuth();

    return () => {
      supabase.auth.onAuthStateChange(() => {}); // Cleanup subscription
    };
  }, []);

  const validateAdminUser = async (userId: string | undefined) => {
    if (!userId) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', userId)
        .single();

      if (adminUser && !error) {
        setIsAuthenticated(true);
        // Store admin session data
        localStorage.setItem('adminUser', JSON.stringify(adminUser));
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem('adminUser');
      }
    } catch (error) {
      console.error('Error validating admin user:', error);
      setIsAuthenticated(false);
      localStorage.removeItem('adminUser');
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }

      if (session?.user) {
        // Check if we have cached admin data
        const cachedAdmin = localStorage.getItem('adminUser');
        if (cachedAdmin) {
          setIsAuthenticated(true);
          setLoading(false);
          // Validate in background
          validateAdminUser(session.user.id);
        } else {
          await validateAdminUser(session.user.id);
        }
      } else {
        setIsAuthenticated(false);
        setLoading(false);
        localStorage.removeItem('adminUser');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setLoading(false);
      localStorage.removeItem('adminUser');
    }
  };

  // Increased timeout and added loading state check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Auth check timed out');
        setLoading(false);
        // Don't automatically set authenticated to false, maintain previous state
        const cachedAdmin = localStorage.getItem('adminUser');
        if (cachedAdmin) {
          setIsAuthenticated(true);
        }
      }
    }, 10000); // Increased to 10 seconds

    return () => clearTimeout(timeoutId);
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
