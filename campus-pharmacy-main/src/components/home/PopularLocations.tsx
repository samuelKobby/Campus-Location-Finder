import React from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';

const popularLocations = [
  { name: 'Main Library', description: 'Central Campus' },
  { name: 'Student Union', description: 'North Campus' },
  { name: 'Science Complex', description: 'West Campus' },
  { name: 'Athletics Center', description: 'South Campus' },
  { name: 'Administration Building', description: 'Central Campus' },
];

export const PopularLocations: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Popular Locations</h2>
      <div className="space-y-4">
        {popularLocations.map((location) => (
          <button
            key={location.name}
            className="w-full flex items-start p-3 rounded-lg hover:bg-blue-50 transition-colors text-left"
          >
            <FaMapMarkerAlt className="text-red-500 mt-1 mr-3 flex-shrink-0" size={16} />
            <div>
              <h3 className="font-medium text-gray-900">{location.name}</h3>
              <p className="text-sm text-gray-500">{location.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
