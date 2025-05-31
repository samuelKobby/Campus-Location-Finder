import React from 'react';

export const CampusMap: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-[600px]">
      <div className="bg-gray-100 h-full rounded-lg flex items-center justify-center">
        {/* TODO: Implement actual map integration */}
        <div className="text-center text-gray-500">
          <p className="text-lg mb-2">Interactive Campus Map</p>
          <p className="text-sm">Map integration coming soon</p>
        </div>
      </div>
    </div>
  );
};
