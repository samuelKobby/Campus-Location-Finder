import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../navigation/Navbar';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const hideFooterPaths = ['/admin', '/admin/login'];
  const shouldShowFooter = !hideFooterPaths.some(path => location.pathname.startsWith(path));
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className={`flex-grow ${!isHomePage ? 'container mx-auto px-4 py-8' : ''}`}>
        <Outlet />
      </main>
      {shouldShowFooter && (
        <footer className="bg-gray-800 text-white py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">About Us</h3>
                <p className="text-gray-300">
                  Pharmar Finder helps you locate and access pharmacies and medicines easily.
                  Our platform connects you with local pharmacies and provides real-time
                  medicine availability information.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/" className="text-gray-300 hover:text-white">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="/medicines" className="text-gray-300 hover:text-white">
                      Medicines
                    </a>
                  </li>
                  <li>
                    <a href="/pharmacies" className="text-gray-300 hover:text-white">
                      Pharmacies
                    </a>
                  </li>
                  <li>
                    <a href="/admin/login" className="text-gray-300 hover:text-white">
                      Admin Login
                    </a>
                  </li>
                  <li>
                    <a href="/pharmacy/login" className="text-gray-300 hover:text-white">
                      Pharmacy Login
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>Email: info@pharmarfinder.com</li>
                  <li>Phone: +233 (0) 123 456 789</li>
                  <li>Address: Accra, Ghana</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
              <p>&copy; {new Date().getFullYear()} Pharmar Finder. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
