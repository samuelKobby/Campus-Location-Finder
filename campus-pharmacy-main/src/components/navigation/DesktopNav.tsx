import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaGraduationCap, FaBook, FaUtensils, FaDumbbell, FaCoffee, FaBriefcaseMedical } from 'react-icons/fa';

const categories = [
  { name: 'Academic Buildings', icon: FaGraduationCap, path: '/category/academic' },
  { name: 'Libraries', icon: FaBook, path: '/category/libraries' },
  { name: 'Dining Halls', icon: FaUtensils, path: '/category/dining' },
  { name: 'Sports Facilities', icon: FaDumbbell, path: '/category/sports' },
  { name: 'Student Centers', icon: FaCoffee, path: '/category/student-centers' },
  { name: 'Health Services', icon: FaBriefcaseMedical, path: '/category/health' },
];

export const DesktopNav: React.FC = () => {
  return (
    <nav className="hidden md:flex items-center space-x-8">
      <div className="relative group">
        <button className="flex items-center space-x-1 text-white hover:text-white transition-colors py-2">
          <span>Categories</span>
          <FaChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
        </button>
        <div className="absolute left-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={category.path}
              className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors rounded-md"
            >
              <category.icon className="mr-3" />
              {category.name}
            </Link>
          ))}
        </div>
      </div>
      <Link to="/about" className="text-white hover:text-white transition-colors">
        About
      </Link>
      <Link to="/contact" className="text-white hover:text-white transition-colors">
        Contact
      </Link>
      <Link to="/map" className="text-white hover:text-white transition-colors">
        Interactive Map
      </Link>
    </nav>
  );
};