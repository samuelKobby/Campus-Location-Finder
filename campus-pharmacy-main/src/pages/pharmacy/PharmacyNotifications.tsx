import React, { useEffect, useState } from 'react';
import { usePharmacyAuth } from '../../contexts/PharmacyAuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

export const PharmacyNotifications: React.FC = () => {
  const { pharmacyId } = usePharmacyAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        if (!pharmacyId) return;

        const { data, error } = await supabase
          .from('pharmacy_notifications')
          .select('*')
          .eq('pharmacy_id', pharmacyId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setNotifications(data || []);
      } catch (error: any) {
        console.error('Error fetching notifications:', error);
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [pharmacyId]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('pharmacy_notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('pharmacy_id', pharmacyId);

      if (error) throw error;

      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
          <p className="mt-2 text-sm text-gray-700">
            Your pharmacy's notifications and updates.
          </p>
        </div>
      </div>

      <div className="mt-8">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
          </div>
        ) : (
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              {notifications.map((notification, index) => (
                <li key={notification.id}>
                  <div className="relative pb-8">
                    {index !== notifications.length - 1 && (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                          notification.read ? 'bg-gray-400' : 'bg-blue-500'
                        }`}>
                          <Bell className="h-5 w-5 text-white" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium text-gray-900">
                              {notification.title}
                            </span>
                          </p>
                          <p className="mt-2 text-sm text-gray-700">{notification.message}</p>
                        </div>
                        <div className="whitespace-nowrap text-right text-sm text-gray-500">
                          <time dateTime={notification.created_at}>
                            {new Date(notification.created_at).toLocaleDateString()}
                          </time>
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
