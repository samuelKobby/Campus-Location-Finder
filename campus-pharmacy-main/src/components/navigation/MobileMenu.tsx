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

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  const handleLinkClick = () => {
    onClose();
    setIsCategoriesOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="px-4 pt-2 pb-4 space-y-2 bg-gray-900">
      <Link
        to="/map"
        className="block px-3 py-2 text-gray-300 hover:text-white transition-colors"
        onClick={handleLinkClick}
      >
        Interactive Map
      </Link>

      {/* Categories Dropdown */}
      <div>
        <button
          className="flex items-center w-full px-3 py-2 text-gray-300 hover:text-white transition-colors"
          onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
        >
          <span>Categories</span>
          <FaChevronDown className={`ml-2 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Categories List */}
        <div className={`mt-1 space-y-1 ${isCategoriesOpen ? 'block' : 'hidden'}`}>
          {categories.map((category) => (
            <Link
              key={category.name}
              to={category.path}
              className="flex items-center px-8 py-2 text-gray-400 hover:text-white transition-colors"
              onClick={handleLinkClick}
            >
              <category.icon className="mr-3" />
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      <Link
        to="/about"
        className="block px-3 py-2 text-gray-300 hover:text-white transition-colors"
        onClick={handleLinkClick}
      >
        About
      </Link>

      <Link
        to="/contact"
        className="block px-3 py-2 text-gray-300 hover:text-white transition-colors"
        onClick={handleLinkClick}
      >
        Contact
      </Link>
    </div>
  );
};