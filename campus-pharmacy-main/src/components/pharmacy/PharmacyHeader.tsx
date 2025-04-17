import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaUserCircle, FaBars, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { usePharmacyAuth } from '../../contexts/PharmacyAuthContext';

interface HeaderProps {
  pharmacyName: string;
  onMenuClick: () => void;
}

interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
}

export const PharmacyHeader: React.FC<HeaderProps> = ({
  pharmacyName,
  onMenuClick,
}) => {
  const { logout } = usePharmacyAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
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

  // Sample notifications - in real app, fetch from API
  const notifications: Notification[] = [
    {
      id: '1',
      message: 'Low stock alert: Paracetamol',
      time: '5 minutes ago',
      read: false
    },
    {
      id: '2',
      message: 'New prescription request',
      time: '1 hour ago',
      read: false
    },
    {
      id: '3',
      message: 'Inventory update completed',
      time: '2 hours ago',
      read: true
    }
  ];

  return (
    <header className="bg-white/20 backdrop-blur-md shadow-sm mt-4 mr-4 ml-4 rounded-full border border-white/30 relative z-50">
      <div className="flex justify-between items-center px-4 sm:px-6 py-4">
        <div className="flex items-center">
          <button 
            onClick={onMenuClick}
            className="p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-gray-500 lg:hidden"
          >
            <FaBars className="w-6 h-6" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 ml-2 sm:ml-0">Pharmacy Dashboard</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button 
              className="text-gray-600 hover:text-gray-800 relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell className="w-5 h-5 sm:w-6 sm:h-6" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 transform translate-x-1/2 -translate-y-1/2"></span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-[60] border border-gray-100">
                <div className="px-4 py-2 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-50/80 ${!notification.read ? 'bg-blue-50' : ''}`}
                    >
                      <p className="text-sm text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
                <Link
                  to="/pharmacy/notifications"
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
              <FaUserCircle className="w-6 h-6 sm:w-8 sm:h-8" />
              <span className="hidden sm:block text-sm font-medium">{pharmacyName}</span>
            </button>

            {/* Profile dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-[60] border border-gray-100">
                <Link
                  to="/pharmacy/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/80"
                >
                  <FaCog className="w-4 h-4 mr-2" />
                  Settings
                </Link>
                <button
                  onClick={logout}
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
