import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://ayzkwwgwkbsbxdkloide.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5emt2d2d3a2JzYnhka2xvaWRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxMjc4MTEsImV4cCI6MjA1MjcwMzgxMX0.ZaEINeBxbB7nTXasUuG6ixSQKk2LN8IzGpRdAG2e5fA';
const supabase = createClient(supabaseUrl, supabaseKey);

interface Medicine {
  id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  price: number;
  available: boolean;
  image: string;
  pharmacy_id: string;
}

interface Pharmacy {
  id: string;
  name: string;
  location: string;
  hours: string;
  phone: string;
  available: boolean;
  image: string;
}

interface SearchResult {
  pharmacy: Pharmacy;
  medicines: Medicine[];
}

export const SearchResults: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q')?.toLowerCase() || '';
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        
        // First, find medicines matching the search query
        const { data: medicines, error: medicineError } = await supabase
          .from('medicines')
          .select('*, pharmacy_id')
          .ilike('name', `%${query}%`)
          .or(`description.ilike.%${query}%`);

        if (medicineError) throw medicineError;

        if (!medicines || medicines.length === 0) {
          setSearchResults([]);
          return;
        }

        // Get unique pharmacy IDs
        const pharmacyIds = [...new Set(medicines.map(m => m.pharmacy_id))];

        // Fetch pharmacy details
        const { data: pharmacies, error: pharmacyError } = await supabase
          .from('pharmacies')
          .select('*')
          .in('id', pharmacyIds);

        if (pharmacyError) throw pharmacyError;

        // Combine the data
        const results = pharmacies.map(pharmacy => ({
          pharmacy,
          medicines: medicines.filter(m => m.pharmacy_id === pharmacy.id)
        }));

        setSearchResults(results);
      } catch (err) {
        console.error('Search error:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="text-center">
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (searchResults.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="text-center">
          <p className="text-gray-600">No results found for "{query}"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h2 className="text-2xl font-bold mb-6">
        Search Results for "{query}"
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {searchResults.map(({ pharmacy, medicines }) => (
          <div key={pharmacy.id} className="bg-white rounded-lg shadow-md p-6">
            <img
              src={pharmacy.image}
              alt={pharmacy.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">{pharmacy.name}</h3>
            <p className="text-gray-600 mb-2">{pharmacy.location}</p>
            <p className="text-gray-600 mb-2">Hours: {pharmacy.hours}</p>
            <p className="text-gray-600 mb-4">Phone: {pharmacy.phone}</p>
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Available Medicines:</h4>
              <ul className="space-y-2">
                {medicines.map(medicine => (
                  <li key={medicine.id} className="flex justify-between">
                    <span>{medicine.name}</span>
                    <span className="font-semibold">GH₵{medicine.price.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
