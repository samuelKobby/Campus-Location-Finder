import React, { useState, useEffect } from 'react';
import { FaBell, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  time: string;
  read: boolean;
  created_at: string;
}

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedNotifications = (data || []).map(notification => ({
        ...notification,
        time: formatTime(notification.created_at)
      }));

      setNotifications(formattedNotifications);
    } catch (error: any) {
      setError(error.message);
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

  const markAsRead = async (id: number) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      setNotifications(notifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      ));
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);

      if (error) throw error;

      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <FaCheck className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <FaExclamationTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <FaTimes className="h-5 w-5 text-red-500" />;
      default:
        return <FaBell className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationBg = (type: string, read: boolean) => {
    if (read) return 'bg-gray-50';
    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'error':
        return 'bg-red-50';
      default:
        return 'bg-blue-50';
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaTimes className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
        <p className="text-gray-600 mt-1">Stay updated with important alerts and messages</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaBell className="text-blue-500" />
            <span className="font-medium">All Notifications</span>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {notifications.filter(n => !n.read).length} new
            </span>
          </div>
          {notifications.some(n => !n.read) && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-500 hover:text-blue-700"
            >
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 ${getNotificationBg(notification.type, notification.read)} hover:bg-gray-50 transition-colors duration-150`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                        {notification.title}
                      </p>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-500">{notification.time}</span>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-sm text-blue-500 hover:text-blue-700"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                    <p className={`mt-1 text-sm ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
