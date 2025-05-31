import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
}

export const NavLink: React.FC<NavLinkProps> = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`text-white px-3 py-2 rounded-md text-sm font-medium transition-colors
        ${isActive 
          ? 'bg-blue-600' 
          : 'hover:bg-blue-600'
        }`}
    >
      {children}
    </Link>
  );
};