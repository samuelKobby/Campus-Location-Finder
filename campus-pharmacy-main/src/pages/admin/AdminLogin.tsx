import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FaLock, FaEnvelope, FaUserShield, FaEye, FaEyeSlash } from 'react-icons/fa';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const cachedAdmin = localStorage.getItem('adminUser');
      
      if (session?.user && cachedAdmin) {
        const from = (location.state as any)?.from?.pathname || '/admin';
        navigate(from, { replace: true });
      }
    };
    
    checkSession();
  }, [navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Store user data
        const adminData = {
          id: authData.user.id,
          email: authData.user.email,
          full_name: authData.user.email?.split('@')[0] || 'Admin User',
          role: 'Admin'
        };
        
        localStorage.setItem('adminUser', JSON.stringify(adminData));
        localStorage.setItem('sb-access-token', authData.session?.access_token || '');
        localStorage.setItem('sb-refresh-token', authData.session?.refresh_token || '');

        // Redirect to admin dashboard with the correct path
        const from = (location.state as any)?.from?.pathname || '/admin';
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred during login');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('sb-access-token');
      localStorage.removeItem('sb-refresh-token');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(null); // Clear error when user types
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-md w-full space-y-8 relative">
        {/* Card Effect */}
        <div className="absolute inset-0 bg-white rounded-2xl shadow-xl"></div>
        
        {/* Content */}
        <div className="relative p-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 border border-blue-100">
              <FaUserShield className="h-8 w-8 text-blue-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h2>
            <p className="text-gray-500 text-sm">Secure access to administrative dashboard</p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-blue-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg 
                             bg-white text-gray-900 placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                             transition-all duration-200"
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-blue-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg 
                             bg-white text-gray-900 placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                             transition-all duration-200"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {/* <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-500 
                           focus:ring-blue-500/40 transition-colors duration-200"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                  Remember me
                </label> */}
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-500 hover:text-blue-600 transition-colors duration-200">
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white 
                           ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} 
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                           transition-colors duration-200`}
              >
                {loading ? (
                  <span className="absolute right-1 inset-y-0 flex items-center pr-4">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                ) : null}
                <span>{loading ? 'Signing in...' : 'Sign in'}</span>
              </button>
            </div>
          </form>

          <div className="mt-6 text-center space-y-4">
            {/* <div className="text-sm">
              <Link to="/admin/signup" className="text-blue-500 hover:text-blue-600 font-medium">
                Create new admin account
              </Link>
            </div> */}
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
