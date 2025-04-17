import React from 'react';
import { Link } from 'react-router-dom';
import { pharmacies } from '../../data/sampleData';

export const FeaturedPharmacies: React.FC = () => {
  // Get first 3 pharmacies
  const featuredPharmacies = pharmacies.slice(0, 3);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Nearby Pharmacies</h2>
          <Link
            to="/pharmacies"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View All Pharmacies →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredPharmacies.map(pharmacy => (
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
                  <p>📍 {pharmacy.location}</p>
                  <p>⏰ {pharmacy.hours}</p>
                  <p>
                    📞{' '}
                    <a
                      href={`tel:${pharmacy.phone}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {pharmacy.phone}
                    </a>
                  </p>
                </div>
                <div className="mt-4">
                  <Link
                    to={`/pharmacies/${pharmacy.id}`}
                    className="inline-block w-full text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};