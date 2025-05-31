import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkedAlt } from 'react-icons/fa';

export const Logo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <FaMapMarkedAlt className="h-6 w-6 text-white" />
      <span className="text-xl font-bold text-white">
        CampusGuide
      </span>
    </Link>
  );
};