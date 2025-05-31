import React from 'react';
import { CategoryCard } from '../categories/CategoryCard';
import { MEDICATION_CATEGORIES } from '../../constants/categories';

export const CategoryGrid: React.FC = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Categories</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {MEDICATION_CATEGORIES.map((category) => (
          <CategoryCard
            key={category.id}
            id={category.id}
            title={category.title}
            icon={category.icon}
          />
        ))}
      </div>
    </section>
  );
};