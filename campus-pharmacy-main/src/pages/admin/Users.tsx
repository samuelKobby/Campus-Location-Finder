import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaUserEdit, FaTrash, FaSearch, FaTimes, FaStore } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { createNotification } from '../../utils/notifications';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  last_sign_in_at: string | null;
  pharmacy_id?: string;
}

interface UserFormData {
  full_name: string;
  email: string;
  role: string;
  password?: string;
  pharmacy_id?: string;
}

interface Pharmacy {
  id: string;
  name: string;
}

interface NotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  pharmacy_id?: string;
}



export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    full_name: '',
    email: '',
    role: 'Staff',
    password: ''
  });
  const [creatingPharmacyUsers, setCreatingPharmacyUsers] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchPharmacies();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: adminUsers, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .order('full_name');

      if (adminError) throw adminError;

      const { data: pharmacyUsers, error: pharmacyError } = await supabase
        .from('pharmacy_users')
        .select('*, pharmacies!inner(name)')
        .order('username');

      if (pharmacyError) throw pharmacyError;

      const allUsers = [
        ...adminUsers.map(user => ({
          ...user,
          status: user.last_sign_in_at ? 'Active' : 'Inactive'
        })),
        ...(pharmacyUsers || []).map(user => ({
          id: user.id,
          full_name: user.pharmacies.name,
          username: user.username,
          role: 'Pharmacy',
          status: user.last_sign_in_at ? 'Active' : 'Inactive',
          last_sign_in_at: user.last_sign_in_at,
          pharmacy_id: user.pharmacy_id
        }))
      ];

      setUsers(allUsers);
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPharmacies = async () => {
    try {
      const { data, error } = await supabase
        .from('pharmacies')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setPharmacies(data || []);
    } catch (error: any) {
      console.error('Error fetching pharmacies:', error);
    }
  };

  const createPharmacyUsers = async () => {
    try {
      setCreatingPharmacyUsers(true);
      setError(null);
      let createdCount = 0;
      let errorCount = 0;

      for (const pharmacy of pharmacies) {
        // Check if user already exists
        const { data: existingUsers } = await supabase
          .from('pharmacy_users')
          .select('id, pharmacy:pharmacies(email)')
          .eq('pharmacy_id', pharmacy.id);

        if (existingUsers && existingUsers.length > 0) continue;

        const password = generateTemporalPassword(pharmacy.name);
        // Use the actual pharmacy name as entered for the username
        const username = pharmacy.name;
        
        // Create pharmacy user directly in the database
        const { error: dbError } = await supabase
          .from('pharmacy_users')
          .insert([{
            username: username,
            password: password,
            pharmacy_id: pharmacy.id
          }]);

        if (dbError) {
          console.error(`Error creating pharmacy user for ${pharmacy.name}:`, dbError);
          errorCount++;
          
          // Create error notification for admin
          await createNotification({
            title: `Failed to create user for ${pharmacy.name}`,
            message: `Error: ${dbError.message}`,
            type: 'error',
            pharmacy_id: pharmacy.id
          });
          
          continue;
        }
        
        // Create success notification for admin
        await createNotification({
          title: `New pharmacy user created`,
          message: `Successfully created user account for ${pharmacy.name}`,
          type: 'success',
          pharmacy_id: pharmacy.id
        });
        
        createdCount++;

        // Send email with credentials if email exists
        // const pharmacyEmail = existingUsers?.[0]?.pharmacy?.email;
        // if (pharmacyEmail) {
        //   const { error: emailError } = await supabase.functions.invoke('send-pharmacy-credentials', {
        //     body: {
        //       email: pharmacyEmail,
        //       pharmacyName: pharmacy.name,
        //       username: username,
        //       password: password
        //     }
        //   });

        //   if (emailError) {
        //     console.error(`Error sending credentials email to ${pharmacy.name}:`, emailError);
        //   }
        // }
      }

      await fetchUsers();
      // Use the system's toast notification instead of browser alert
      if (createdCount > 0) {
        toast.success(`${createdCount} pharmacy users created successfully!`);
        
        // Create summary notification for admin
        if (createdCount > 1) {
          await createNotification({
            title: `Bulk pharmacy user creation`,
            message: `${createdCount} pharmacy users were created successfully${errorCount > 0 ? ` (${errorCount} failed)` : ''}.`,
            type: 'info'
          });
        }
      } else if (errorCount > 0) {
        toast.error(`Failed to create pharmacy users. Check notifications for details.`);
      } else {
        toast('No new pharmacy users created. All pharmacies already have accounts.');
      }
    } catch (error: any) {
      setError(error.message);
      console.error('Error creating pharmacy users:', error);
      toast.error('Error creating pharmacy users');
    } finally {
      setCreatingPharmacyUsers(false);
    }
  };

  const generateTemporalPassword = (pharmacyName: string) => {
    // Create a temporal password with pattern 'Pharm' + pharmacy name
    // Remove spaces and special characters from pharmacy name
    const sanitizedName = pharmacyName.replace(/[^a-zA-Z0-9]/g, '');
    // Ensure the password has at least one uppercase letter, one lowercase letter, and one number
    return `Pharm${sanitizedName}123`;
  };

  const generateRandomPassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);

      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password || generateRandomPassword(),
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Then add the user to our admin_users table
      const { error: dbError } = await supabase
        .from('admin_users')
        .insert([{
          id: authData.user.id,
          full_name: formData.full_name,
          email: formData.email,
          role: formData.role
        }]);

      if (dbError) throw dbError;

      setShowAddModal(false);
      setFormData({
        full_name: '',
        email: '',
        role: 'Staff',
        password: ''
      });
      await fetchUsers();
    } catch (error: any) {
      setError(error.message);
      console.error('Error adding user:', error);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setError(null);
      
      if (editingUser.role === 'Pharmacy') {
        // Update pharmacy user
        if (formData.password) {
          const { error } = await supabase
            .from('pharmacy_users')
            .update({ password: formData.password })
            .eq('id', editingUser.id);

          if (error) throw error;

          // Create success notification for pharmacy password update
          await createNotification({
            title: `Pharmacy password updated`,
            message: `Successfully updated password for ${editingUser.full_name}`,
            type: 'success',
            pharmacy_id: editingUser.pharmacy_id
          });
        }
      } else {
        // Update admin user
        const updates = {
          full_name: formData.full_name,
          role: formData.role
        };

        const { error } = await supabase
          .from('admin_users')
          .update(updates)
          .eq('id', editingUser.id);

        if (error) throw error;

        // Update password if provided
        if (formData.password) {
          const { error: pwError } = await supabase.auth.updateUser({
            password: formData.password
          });
          if (pwError) throw pwError;

          // Create success notification for admin password update
          await createNotification({
            title: `Admin user password updated`,
            message: `Successfully updated password for ${editingUser.full_name}`,
            type: 'success',
            pharmacy_id: editingUser.pharmacy_id
          });
        } else {
          // Create success notification for admin profile update
          await createNotification({
            title: `Admin user updated`,
            message: `Successfully updated ${editingUser.full_name}`,
            type: 'success',
            pharmacy_id: editingUser.pharmacy_id
          });
        }
      }

      setEditingUser(null);
      setFormData({
        full_name: '',
        email: '',
        role: 'Staff',
        password: ''
      });
      await fetchUsers();
      toast.success('User updated successfully!');
    } catch (error: any) {
      setError(error.message);
      console.error('Error updating user:', error);
      toast.error(`Error updating user: ${error.message}`);
      
      // Create error notification
      await createNotification({
        title: `Failed to update user`,
        message: `Error updating ${editingUser.full_name}: ${error.message}`,
        type: 'error',
        pharmacy_id: editingUser.pharmacy_id
      });
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      setError(null);
      
      // Find user details before deletion for notification purposes
      const userToDelete = users.find(user => user.id === id);
      if (!userToDelete) {
        throw new Error('User not found');
      }
      
      if (userToDelete.role === 'Pharmacy') {
        // Delete pharmacy user
        const { error } = await supabase
          .from('pharmacy_users')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        // Create notification for pharmacy user deletion
        await createNotification({
          title: `Pharmacy user deleted`,
          message: `Successfully deleted user account for ${userToDelete.full_name}`,
          type: 'warning',
          pharmacy_id: userToDelete.pharmacy_id
        });
      } else {
        // Delete from admin_users table
        const { error: dbError } = await supabase
          .from('admin_users')
          .delete()
          .eq('id', id);

        if (dbError) throw dbError;

        // Delete auth user
        const { error: authError } = await supabase.auth.admin.deleteUser(id);
        if (authError) throw authError;
        
        // Create notification for admin user deletion
        await createNotification({
          title: `Admin user deleted`,
          message: `Successfully deleted user account for ${userToDelete.full_name}`,
          type: 'warning'
        });
      }

      await fetchUsers();
      toast.success('User deleted successfully!');
    } catch (error: any) {
      setError(error.message);
      console.error('Error deleting user:', error);
      toast.error(`Error deleting user: ${error.message}`);
      
      // Create error notification
      await createNotification({
        title: `Failed to delete user`,
        message: `Error: ${error.message}`,
        type: 'error'
      });
    }
  };

  const formatLastLogin = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const roles = Array.from(new Set(users.map(u => u.role)));

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">User Management</h1>
        <div className="w-full sm:w-auto">
          <button
            onClick={createPharmacyUsers}
            disabled={creatingPharmacyUsers}
            className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaStore className="mr-2" /> 
            {creatingPharmacyUsers ? 'Updating Users...' : 'Update Users'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-40 border rounded-lg px-4 py-2"
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Pharmacy">Pharmacy</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40 border rounded-lg px-4 py-2"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No users found</p>
          </div>
        ) : (
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-x-auto border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.role}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatLastLogin(user.last_sign_in_at)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setFormData({
                              full_name: user.full_name,
                              email: user.email,
                              role: user.role,
                              password: ''
                            });
                          }}
                          className="text-blue-600 hover:text-blue-900 mx-2"
                        >
                          <FaUserEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 mx-2"
                        >
                          <FaTrash className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit User Modal */}
      {(showAddModal || editingUser) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="mt-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      required
                      disabled={!!editingUser}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Pharmacist">Pharmacist</option>
                      {/* <option value="Staff">Staff</option> */}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                    </label>
                    <input
                      type="password"
                      required={!editingUser}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-5 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingUser(null);
                      setFormData({
                        full_name: '',
                        email: '',
                        role: 'Staff',
                        password: ''
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md"
                  >
                    {editingUser ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
