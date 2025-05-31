import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Clock, Phone, Package, Navigation } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { locationImages } from '../utils/imageUrls';
import { toast } from 'react-hot-toast';

interface Medicine {
  id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  price: number;
  image: string;
}

interface Pharmacy {
  id: string;
  name: string;
  location: string;
  phone: string;
  hours: string;
  image: string;
}

// Raw shape of data from Supabase join query
type SupabaseJoinRow = {
  quantity: any;
  price: any;
  pharmacies: {
    id: any;
    name: any;
    location: any;
    hours: any;
    phone: any;
    image: any;
  }[];
}

interface PharmacyDetails {
  id: string;
  name: string;
  address: string;
  phone: string;
  operating_hours: string;
  image_url: string;
  quantity: number;
  price: number;
}

export const MedicineDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [pharmacies, setPharmacies] = useState<PharmacyDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const getDirectionsUrl = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  useEffect(() => {
    const fetchMedicine = async () => {
      if (!id) return;

      try {
        // First get the medicine details
        const { data: medicineData, error: medicineError } = await supabase
          .from('medicines')
          .select('*')
          .eq('id', id)
          .single();

        if (medicineError) throw medicineError;
        console.log('Medicine:', medicineData);
        setMedicine(medicineData);

        // Then get the pharmacies that have this medicine in stock
        const { data: pharmacyData, error } = await supabase
          .from('medicine_pharmacies')
          .select(`
            quantity,
            pharmacies (
              id,
              name,
              location,
              hours,
              phone,
              image
            )
          `)
          .eq('medicine_id', id)
          .gt('quantity', 0);

        if (error) throw error;
        console.log('Raw pharmacy data:', pharmacyData);

        // Format pharmacy data
        const pharmacyItems = (pharmacyData || []).map((item: any) => ({
          id: item.pharmacies.id,
          name: item.pharmacies.name,
          address: item.pharmacies.location,
          phone: item.pharmacies.phone,
          operating_hours: item.pharmacies.hours,
          image_url: item.pharmacies.image,
          quantity: Number(item.quantity) || 0,
          price: medicineData.price // Use price from medicine data
        }));

        console.log('Available pharmacies:', pharmacyItems);
        setPharmacies(pharmacyItems);
      } catch (error: any) {
        console.log('Error fetching data:', error);
        toast.error('Error loading medicine details');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicine();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Medicine not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      {/* Medicine Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3">
            <img
              className="w-full h-64 object-cover rounded-lg shadow-lg mb-6"
              src={medicine?.image || locationImages.pharmacy}
              alt={medicine?.name}
            />
          </div>
          <div className="w-full md:w-2/3">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{medicine?.name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-600">Category</p>
                <p className="text-lg font-medium">{medicine?.category}</p>
              </div>
              <div>
                <p className="text-gray-600">Price per {medicine?.unit}</p>
                <p className="text-lg font-medium">GH₵{medicine?.price}</p>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-gray-600 mb-2">Description</p>
              <p className="text-gray-800">{medicine?.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Pharmacies */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available at These Pharmacies</h2>
        {pharmacies.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No pharmacies currently have this medicine in stock</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pharmacies.map((pharmacy) => (
              <div key={pharmacy.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={pharmacy.image_url || locationImages.pharmacy}
                      alt={pharmacy.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{pharmacy.name}</h3>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        <p>{pharmacy.address}</p>
                      </div>
                      <div className="flex items-center text-gray-600 mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        <p>{pharmacy.operating_hours}</p>
                      </div>
                      <div className="flex items-center text-gray-600 mt-1">
                        <Phone className="h-4 w-4 mr-1" />
                        <p>{pharmacy.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">In Stock</p>
                    <p className="text-lg font-semibold text-green-600">{pharmacy.quantity} units</p>
                    <p className="text-sm text-gray-600 mt-1">Price</p>
                    <p className="text-lg font-semibold text-blue-600">GH₵{pharmacy.price}</p>
                    <button
                      onClick={() => window.open(getDirectionsUrl(pharmacy.address), '_blank')}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Get Directions
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
