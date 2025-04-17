import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FaUser, FaEnvelope, FaLock, FaUserShield } from 'react-icons/fa';
import toast from 'react-hot-toast';

export const AdminSignup: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.fullName) {
      setError('All fields are required');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    try {
      setLoading(true);

      // First check if the email exists in auth
      const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers();
      const existingUser = users?.find(user => user.email === formData.email);

      // Check if admin user already exists in admin_users table
      const { data: existingAdmins, error: checkError } = await supabase
        .from('admin_users')
        .select('id');

      if (checkError) {
        console.error('Error checking existing admins:', checkError);
        throw new Error('Error checking existing admins');
      }

      if (existingAdmins && existingAdmins.length > 0) {
        setError('An admin user already exists. Please contact the existing administrator.');
        return;
      }

      let userId: string;

      if (existingUser) {
        // If user exists in auth but not in admin_users, use their ID
        userId = existingUser.id;
      } else {
        // Create new auth user if they don't exist
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              role: 'admin'
            }
          }
        });

        if (authError) {
          console.error('Auth error:', authError);
          throw authError;
        }

        if (!authData.user) {
          throw new Error('Failed to create user account');
        }

        userId = authData.user.id;
      }

      console.log('Using user ID:', userId);

      // Create admin user record
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({
          id: userId,
          email: formData.email,
          full_name: formData.fullName,
          role: 'admin'
        });

      if (adminError) {
        console.error('Admin insert error:', adminError);
        throw adminError;
      }

      console.log('Admin user created successfully');

      // Log the activity
      const { error: logError } = await supabase
        .from('activity_logs')
        .insert({
          action_type: 'create',
          entity_type: 'admin_user',
          user_id: userId,
          details: {
            email: formData.email,
            role: 'admin'
          }
        });

      if (logError) {
        console.error('Activity log error:', logError);
      }

      toast.success('Admin account created successfully! Please check your email to verify your account.');
      navigate('/admin/login');
    } catch (error: any) {
      console.error('Error creating admin user:', error);
      if (error.message.includes('already registered')) {
        setError('This email is already registered. Please use a different email or try logging in.');
      } else {
        setError(error.message || 'Error creating admin user. Please check the console for details.');
      }
    } finally {
      setLoading(false);
    }
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Admin Account</h2>
            <p className="text-gray-500 text-sm">Set up your administrator access</p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSignup}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="sr-only">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-blue-500" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg 
                             bg-white text-gray-900 placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                             transition-all duration-200"
                    placeholder="Full Name"
                  />
                </div>
              </div>

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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg 
                             bg-white text-gray-900 placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                             transition-all duration-200"
                    placeholder="Password"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-blue-500" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg 
                             bg-white text-gray-900 placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                             transition-all duration-200"
                    placeholder="Confirm Password"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent 
                         rounded-lg text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                         transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link to="/admin/login" className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
