import React from 'react';
import { useParams } from 'react-router-dom';

export const CategoryView: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Category: {id}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Category items will be populated here */}
        <p>No items found in this category.</p>
      </div>
    </div>
  );
};
