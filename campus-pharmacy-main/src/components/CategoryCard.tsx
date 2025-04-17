import React from 'react';
import { Link } from 'react-router-dom';

interface CategoryCardProps {
  title: string;
  icon: React.ElementType;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ title, icon: IconComponent }) => {
  return (
    <Link
      to={`/category/${title.toLowerCase()}`}
      className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="w-12 h-12 flex items-center justify-center text-indigo-600 mb-3">
        <IconComponent className="w-8 h-8" />
      </div>
      <span className="text-sm font-medium text-gray-900">{title}</span>
    </Link>
  );
};