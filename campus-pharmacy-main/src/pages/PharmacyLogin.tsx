import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { FaStore, FaLock, FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';

export const PharmacyLogin: React.FC = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Clear auth state when component mounts
  React.useEffect(() => {
    localStorage.removeItem('pharmacyId');
    localStorage.removeItem('pharmacyName');
    localStorage.removeItem('userRole');
    // Notify context of auth change
    window.dispatchEvent(new Event('pharmacyAuthChange'));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clear any existing auth data
      localStorage.removeItem('pharmacyId');
      localStorage.removeItem('pharmacyName');
      localStorage.removeItem('userRole');

      // Call our custom pharmacy auth function
      const { data, error: rpcError } = await supabase
        .rpc('pharmacy_user_auth', {
          username: credentials.username,
          password: credentials.password
        });

      if (rpcError) throw rpcError;

      if (!data.success) {
        throw new Error(data.message || 'Invalid username or password');
      }

      // Store pharmacy data
      localStorage.setItem('pharmacyId', data.user.pharmacy_id);
      localStorage.setItem('pharmacyName', data.user.pharmacy_name);
      localStorage.setItem('userRole', 'pharmacy');
      
      // Check if this is the first login (using the default password pattern)
      const isDefaultPassword = credentials.password.startsWith('Pharm') && credentials.password.endsWith('123');
      if (isDefaultPassword) {
        localStorage.setItem('requirePasswordChange', 'true');
      }

      // Dispatch custom event to notify context of auth change
      window.dispatchEvent(new Event('pharmacyAuthChange'));

      toast.success('Login successful!');
      
      // If using default password, redirect to password change page
      if (isDefaultPassword) {
        navigate('/pharmacy/change-password', { replace: true });
      } else {
        // Navigate to dashboard and prevent going back to login
        navigate('/pharmacy/dashboard', { replace: true });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
            <FaStore className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Pharmacy Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your pharmacy dashboard
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Username Input */}
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-blue-500" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={credentials.username}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg 
                             bg-white text-gray-900 placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                             transition-all duration-200"
                  placeholder="Username"
                />
              </div>
            </div>

            {/* Password Input */}
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
                  required
                  value={credentials.password}
                  onChange={handleChange}
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

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                loading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-sm text-center">
            <button
              onClick={() => navigate('/')}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Back to Home
            </button>
          </div>
        </form>

        {/* Security Notice */}
        <div className="mt-6 space-y-2">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-800">
              <strong>First time logging in?</strong> Your temporary password is: <span className="font-mono">Pharm[YourPharmacyName]123</span>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              You will be prompted to change this password after your first login.
            </p>
          </div>
          <p className="text-xs text-gray-500 text-center">
            This is a secure area. Only authorized pharmacy staff may access this portal.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PharmacyLogin;
