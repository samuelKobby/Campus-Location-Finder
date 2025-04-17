import React from 'react';

export const HomeHeader: React.FC = () => {
  return (
    <div className="bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Find Campus Pharmacies Near You
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Search for medications and find the nearest campus pharmacy with our easy-to-use pharmacy finder.
          </p>
        </div>
      </div>
    </div>
  );
};