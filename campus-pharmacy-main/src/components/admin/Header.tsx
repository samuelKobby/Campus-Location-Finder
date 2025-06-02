import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaUserCircle, FaBars, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface HeaderProps {
  adminName: string;
  onMenuClick?: () => void;
  isVisible?: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  created_at: string;
  pharmacy_id?: string;
  time?: string; // Formatted time for display
  read?: boolean; // We'll manage read status in the UI
}

export const Header: React.FC<HeaderProps> = ({ adminName, onMenuClick, isVisible = true }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState<boolean>(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    fetchNotifications();
    
    // Subscribe to changes in the notifications table
    const subscription = supabase
      .channel('notification_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications' }, 
        (payload) => {
          console.log('Notification change detected:', payload);
          fetchNotifications();
        }
      )
      .subscribe();
      
    // Set up a polling mechanism to ensure we get updates even if the subscription fails
    const pollingInterval = setInterval(() => {
      fetchNotifications();
    }, 10000); // Poll every 10 seconds
      
    return () => {
      subscription.unsubscribe();
      clearInterval(pollingInterval);
    };
  }, []);
  
  // Load read status from localStorage on component mount
  useEffect(() => {
    const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
    
    if (readNotifications.length > 0 && notifications.length > 0) {
      // Mark notifications as read if they're in localStorage
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        read: readNotifications.includes(notification.id) ? true : notification.read
      }));
      
      setNotifications(updatedNotifications);
      
      // Update unread count
      const unreadCount = updatedNotifications.filter(n => !n.read).length;
      setUnreadCount(unreadCount);
    }
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      console.log('Fetching notifications...');
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Notifications fetched:', data);
      
      // Get read notifications from localStorage
      const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
      
      const formattedNotifications = (data || []).map(notification => ({
        ...notification,
        time: formatTime(notification.created_at),
        read: readNotifications.includes(notification.id) // Mark as read if in localStorage
      }));

      setNotifications(formattedNotifications);
      
      // Count unread notifications
      const unreadCount = formattedNotifications.filter(n => !n.read).length;
      setUnreadCount(unreadCount);
      console.log('Unread count:', unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };
  
  const markAsRead = async (id: string) => {
    try {
      console.log('Marking notification as read:', id);
      
      // Since there's no read field in the database, we'll just manage read status in the UI
      // Update local state
      setNotifications(notifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      ));
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Store read status in localStorage to persist between sessions
      const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
      if (!readNotifications.includes(id)) {
        readNotifications.push(id);
        localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const markAllAsRead = () => {
    try {
      console.log('Marking all notifications as read');
      
      // Mark all notifications as read in the UI
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        read: true
      }));
      
      setNotifications(updatedNotifications);
      setUnreadCount(0);
      
      // Store all notification IDs in localStorage
      const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
      const allIds = notifications.map(n => n.id);
      const newReadNotifications = [...new Set([...readNotifications, ...allIds])];
      localStorage.setItem('readNotifications', JSON.stringify(newReadNotifications));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  const deleteAllNotifications = async () => {
    try {
      if (!window.confirm('Are you sure you want to delete all notifications?')) return;
      
      console.log('Deleting all notifications');
      
      // Delete all notifications from the database
      const { error } = await supabase
        .from('notifications')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // This will delete all notifications
      
      if (error) throw error;
      
      // Clear notifications from UI immediately
      setNotifications([]);
      setUnreadCount(0);
      setSelectedNotifications([]);
      setSelectMode(false);
      
      // Clear localStorage
      localStorage.removeItem('readNotifications');
      
      toast.success('All notifications deleted');
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      toast.error('Failed to delete notifications');
    }
  };
  
  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    setSelectedNotifications([]);
  };
  
  const toggleSelectNotification = (id: string) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(selectedNotifications.filter(notificationId => notificationId !== id));
    } else {
      setSelectedNotifications([...selectedNotifications, id]);
    }
  };
  
  const deleteSelectedNotifications = async () => {
    try {
      if (selectedNotifications.length === 0) return;
      
      if (!window.confirm(`Are you sure you want to delete ${selectedNotifications.length} selected notification(s)?`)) return;
      
      console.log('Deleting selected notifications:', selectedNotifications);
      
      // Delete selected notifications from the database
      const { error } = await supabase
        .from('notifications')
        .delete()
        .in('id', selectedNotifications);
      
      if (error) throw error;
      
      // Update UI immediately
      const updatedNotifications = notifications.filter(n => !selectedNotifications.includes(n.id));
      setNotifications(updatedNotifications);
      
      // Update unread count
      const newUnreadCount = updatedNotifications.filter(n => !n.read).length;
      setUnreadCount(newUnreadCount);
      
      // Update localStorage
      const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
      const updatedReadNotifications = readNotifications.filter((id: string) => !selectedNotifications.includes(id));
      localStorage.setItem('readNotifications', JSON.stringify(updatedReadNotifications));
      
      // Reset selection
      setSelectedNotifications([]);
      setSelectMode(false);
      
      toast.success(`${selectedNotifications.length} notification(s) deleted`);
    } catch (error) {
      console.error('Error deleting selected notifications:', error);
      toast.error('Failed to delete notifications');
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className={`bg-white/20 backdrop-blur-md shadow-sm mt-4 mr-4 ml-4 rounded-full border border-white/30 relative z-50 transition-opacity duration-200 ${!isVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="flex justify-between items-center px-4 sm:px-6 py-4">
        <div className="flex items-center">
          <button 
            onClick={onMenuClick}
            className="p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-gray-500 lg:hidden"
          >
            <FaBars className="w-6 h-6" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 ml-2 sm:ml-0">Admin Dashboard</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button 
              className="text-gray-600 hover:text-gray-800 relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-[60] border border-gray-100">
                <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  <div className="flex space-x-2">
                    {notifications.length > 0 && (
                      <>
                        {!selectMode ? (
                          <>
                            <button 
                              onClick={markAllAsRead}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Mark all as read
                            </button>
                            <span className="text-gray-300">|</span>
                            <button 
                              onClick={toggleSelectMode}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Select
                            </button>
                            <span className="text-gray-300">|</span>
                            <button 
                              onClick={deleteAllNotifications}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              Delete all
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={toggleSelectMode}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Cancel
                            </button>
                            {selectedNotifications.length > 0 && (
                              <>
                                <span className="text-gray-300">|</span>
                                <button 
                                  onClick={deleteSelectedNotifications}
                                  className="text-xs text-red-600 hover:text-red-800"
                                >
                                  Delete selected ({selectedNotifications.length})
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {loading ? (
                    <div className="px-4 py-3 text-center">
                      <p className="text-sm text-gray-500">Loading notifications...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-3 text-center">
                      <p className="text-sm text-gray-500">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notification) => {
                      // Determine notification color based on type
                      let bgColor = 'bg-gray-50';
                      switch (notification.type) {
                        case 'success': bgColor = 'bg-green-50'; break;
                        case 'warning': bgColor = 'bg-yellow-50'; break;
                        case 'error': bgColor = 'bg-red-50'; break;
                        default: bgColor = 'bg-blue-50';
                      }
                      
                      return (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50/80 ${bgColor} border-b border-gray-100 relative ${selectMode ? 'cursor-pointer' : ''}`}
                          onClick={() => selectMode ? toggleSelectNotification(notification.id) : markAsRead(notification.id)}
                        >
                          <div className="flex items-start">
                            {selectMode && (
                              <div className="mr-2 mt-1">
                                <input
                                  type="checkbox"
                                  checked={selectedNotifications.includes(notification.id)}
                                  onChange={() => toggleSelectNotification(notification.id)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                              <p className="text-sm text-gray-700">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                          </div>
                          {!notification.read && !selectMode && (
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500"></span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
                <Link
                  to="/admin/notifications"
                  className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-50/80 border-t border-gray-100"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative" ref={profileMenuRef}>
            <button 
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <FaUserCircle className="w-6 h-6" />
              <span className="text-sm font-medium">{adminName}</span>
            </button>

            {/* Profile dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-[60] border border-gray-100">
                <Link
                  to="/admin/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/80"
                >
                  <FaUserCircle className="w-4 h-4 mr-2" />
                  Profile
                </Link>
                <Link
                  to="/admin/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/80"
                >
                  <FaCog className="w-4 h-4 mr-2" />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/80"
                >
                  <FaSignOutAlt className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};