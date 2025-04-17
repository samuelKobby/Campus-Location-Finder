import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Store, Package, Clock, Settings, BarChart2, Bell, LogOut } from 'lucide-react';
import { usePharmacyAuth } from '../../contexts/PharmacyAuthContext';

export const PharmacyLayout: React.FC = () => {
  const { pharmacyName, logout } = usePharmacyAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/pharmacy/dashboard', icon: BarChart2 },
    { name: 'Inventory', href: '/pharmacy/inventory', icon: Package },
    { name: 'Operating Hours', href: '/pharmacy/hours', icon: Clock },
    { name: 'Notifications', href: '/pharmacy/notifications', icon: Bell },
    { name: 'Settings', href: '/pharmacy/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-blue-600">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Store className="h-8 w-8 text-white" />
              <span className="ml-2 text-xl font-semibold text-white">{pharmacyName}</span>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-100 hover:bg-blue-700'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-6 w-6 ${
                        isActive ? 'text-white' : 'text-blue-300'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
              <button
                onClick={logout}
                className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-blue-100 hover:bg-blue-700"
              >
                <LogOut className="mr-3 flex-shrink-0 h-6 w-6 text-blue-300" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Store className="h-8 w-8" />
            <span className="ml-2 text-xl font-semibold">{pharmacyName}</span>
          </div>
          {/* Add mobile menu button here if needed */}
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
