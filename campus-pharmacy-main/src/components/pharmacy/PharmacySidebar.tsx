import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaClock,
  FaBoxes,
  FaBell,
  FaCog,
  FaSignOutAlt
} from 'react-icons/fa';
import { usePharmacyAuth } from '../../contexts/PharmacyAuthContext';

interface SidebarProps {
  onClose?: () => void;
}

interface NavItem {
  name: string;
  to: string;
  icon: React.ReactNode;
}

export const PharmacySidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation();
  const { logout } = usePharmacyAuth();

  const mainNavItems: NavItem[] = [
    { name: 'Dashboard', to: '/pharmacy/dashboard', icon: <FaHome /> },
    { name: 'Inventory', to: '/pharmacy/inventory', icon: <FaBoxes /> },
    { name: 'Hours', to: '/pharmacy/hours', icon: <FaClock /> },
    { name: 'Notifications', to: '/pharmacy/notifications', icon: <FaBell /> },
    { name: 'Settings', to: '/pharmacy/settings', icon: <FaCog /> },
  ];

  const NavItem = ({ item }: { item: NavItem }) => {
    const isActive = location.pathname === item.to;

    return (
      <Link
        to={item.to}
        onClick={onClose}
        className={`flex items-center justify-center p-3 text-sm font-medium rounded-full transition-colors duration-200 group relative ${
          isActive
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <span className="text-2xl">{item.icon}</span>
        <span className="absolute left-14 bg-white px-2 py-1 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-gray-200">
          {item.name}
        </span>
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full w-20 py-4 pl-4">
      <div className="flex-1 flex flex-col gap-3">
        <nav className="flex-1 flex items-center justify-center ">
          <div className="flex flex-col gap-1 bg-white backdrop-blur-md rounded-full p-2 border border-white/30">
            {mainNavItems.map((item) => (
              <NavItem key={item.to} item={item} />
            ))}
          </div>
        </nav>

        <div className="bg-white backdrop-blur-md rounded-full p-2 border border-white/30">
          <button
            onClick={() => logout()}
            className="flex items-center justify-center p-3 w-full text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-full transition-colors duration-200 group relative"
          >
            <FaSignOutAlt className="text-2xl" />
            <span className="absolute left-14 bg-white px-2 py-1 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-gray-200">
              Logout
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
