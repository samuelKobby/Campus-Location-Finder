import React, { useState } from 'react';
import { pharmacies } from '../data/sampleData';

export const PharmacyList: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const locations = [...new Set(pharmacies.map(pharmacy => pharmacy.location))];

  const filteredPharmacies = selectedLocation
    ? pharmacies.filter(pharmacy => pharmacy.location === selectedLocation)
    : pharmacies;

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      {/* Filter Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Campus Pharmacies</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label className="font-medium text-gray-700">Filter by location:</label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Locations</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pharmacy Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPharmacies.map((pharmacy) => (
          <div
            key={pharmacy.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <img
              src={pharmacy.image}
              alt={pharmacy.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{pharmacy.name}</h3>
              <div className="space-y-2 text-gray-600">
                <p className="flex items-center">
                  <span className="font-medium mr-2">Location:</span>
                  {pharmacy.location}
                </p>
                <p className="flex items-center">
                  <span className="font-medium mr-2">Hours:</span>
                  {pharmacy.hours}
                </p>
                <p className="flex items-center">
                  <span className="font-medium mr-2">Phone:</span>
                  <a
                    href={`tel:${pharmacy.phone}`}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    {pharmacy.phone}
                  </a>
                </p>
                <div className="pt-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      pharmacy.available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {pharmacy.available ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results Message */}
      {filteredPharmacies.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No pharmacies found for the selected location.</p>
        </div>
      )}
    </div>
  );
};