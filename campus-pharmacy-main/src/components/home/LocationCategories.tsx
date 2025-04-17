import React from 'react';
import { FaGraduationCap, FaBook, FaUtensils, FaDumbbell, FaCoffee, FaBriefcaseMedical } from 'react-icons/fa';

const categories = [
  { name: 'Academic Buildings', icon: FaGraduationCap },
  { name: 'Libraries', icon: FaBook },
  { name: 'Dining Halls', icon: FaUtensils },
  { name: 'Sports Facilities', icon: FaDumbbell },
  { name: 'Student Centers', icon: FaCoffee },
  { name: 'Health Services', icon: FaBriefcaseMedical },
];

export const LocationCategories: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">Categories</h2>
      <div className="space-y-4">
        {categories.map((category) => (
          <button
            key={category.name}
            className="w-full flex items-center p-3 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <category.icon className="text-blue-600 mr-3" size={20} />
            <span className="text-gray-700">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
