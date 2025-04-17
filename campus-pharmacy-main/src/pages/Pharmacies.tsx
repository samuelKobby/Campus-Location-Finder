import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import placeholderImage from '../assets/placeholder.svg';

interface Pharmacy {
  id: string;
  name: string;
  location: string;
  hours: string;
  phone: string;
  latitude: number;
  longitude: number;
  available: boolean;
  image: string;
}

export const Pharmacies: React.FC = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .order('name');

      if (error) throw error;

      setPharmacies(data || []);
    } catch (err) {
      console.error('Error fetching pharmacies:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getDirectionsUrl = (pharmacy: Pharmacy) => {
    const coordinates = `${pharmacy.latitude},${pharmacy.longitude}`;
    const query = encodeURIComponent(`${pharmacy.name} ${pharmacy.location}`);
    return `https://www.google.com/maps/search/${query}/@${coordinates},17z`;
  };

  const filteredPharmacies = pharmacies.filter(pharmacy =>
    pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pharmacy.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="container mx-auto px-4 py-8 mt-16 text-center">Loading...</div>;
  if (error) return <div className="container mx-auto px-4 py-8 mt-16 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Campus Pharmacies</h1>
        <input
          type="text"
          placeholder="Search pharmacies by name or location..."
          className="w-full md:w-96 p-2 border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPharmacies.map((pharmacy) => (
          <div
            key={pharmacy.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <img
              className="h-48 w-full object-cover"
              src={pharmacy.image || placeholderImage}
              alt={pharmacy.name}
            />
            <div className="p-4">
              <h2 className="text-xl font-bold mb-2">{pharmacy.name}</h2>
              <div className="space-y-2 text-gray-600">
                <p className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {pharmacy.location}
                </p>
                <p className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {pharmacy.hours}
                </p>
                <p className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {pharmacy.phone}
                </p>
              </div>
              <a
                href={getDirectionsUrl(pharmacy)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Directions
              </a>
            </div>
          </div>
        ))}
      </div>

      {filteredPharmacies.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No pharmacies found matching your search.</p>
        </div>
      )}
    </div>
  );
};
