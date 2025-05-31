import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { pharmacies } from '../data/sampleData';
import { FaMapMarkerAlt, FaClock, FaPhone, FaEnvelope } from 'react-icons/fa';

interface Pharmacy {
  id: string;
  name: string;
  image: string;
  location: string;
  hours: string;
  phone: string;
  email: string;
  description: string;
}

export const PharmacyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading pharmacy details
    setLoading(true);
    const foundPharmacy = pharmacies.find(p => p.id === id);
    setPharmacy(foundPharmacy || null);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Pharmacy Not Found</h2>
          <p className="text-gray-600">The pharmacy you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-64 md:h-96">
          <img
            src={pharmacy.image}
            alt={pharmacy.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{pharmacy.name}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-center text-gray-700">
                <FaMapMarkerAlt className="w-5 h-5 text-blue-500 mr-3" />
                <span>{pharmacy.location}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <FaClock className="w-5 h-5 text-blue-500 mr-3" />
                <span>{pharmacy.hours}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <FaPhone className="w-5 h-5 text-blue-500 mr-3" />
                <a href={`tel:${pharmacy.phone}`} className="hover:text-blue-500">
                  {pharmacy.phone}
                </a>
              </div>
              <div className="flex items-center text-gray-700">
                <FaEnvelope className="w-5 h-5 text-blue-500 mr-3" />
                <a href={`mailto:${pharmacy.email}`} className="hover:text-blue-500">
                  {pharmacy.email}
                </a>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">About Us</h3>
              <p className="text-gray-700">{pharmacy.description}</p>
            </div>
          </div>
          
          {/* Add more sections as needed */}
        </div>
      </div>
    </div>
  );
};
