import React from 'react';
import { Link } from 'react-router-dom';
import { CategoryIcon } from './CategoryIcon';
import { Icons } from '../../constants/icons';

interface CategoryCardProps {
  id: string;
  title: string;
  icon: keyof typeof Icons;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ id, title, icon }) => {
  return (
    <Link
      to={`/category/${id}`}
      className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="w-12 h-12 flex items-center justify-center text-indigo-600 mb-3">
        <CategoryIcon icon={icon} />
      </div>
      <span className="text-sm font-medium text-gray-900">{title}</span>
    </Link>
  );
};