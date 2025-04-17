import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';

interface LocationFormProps {
  buildingType: string;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  additionalFields?: React.ReactNode;
}

export const LocationForm: React.FC<LocationFormProps> = ({ 
  buildingType, 
  onSubmit, 
  initialData,
  additionalFields 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    address: string;
    latitude: string;
    longitude: string;
    contact_number: string;
    email: string;
    website_url: string;
    opening_hours: {
      [key: string]: { open: string; close: string };
    };
    image_url: string;
  }>(initialData || {
    name: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    contact_number: '',
    email: '',
    website_url: '',
    opening_hours: {
      monday: { open: '09:00', close: '17:00' },
      tuesday: { open: '09:00', close: '17:00' },
      wednesday: { open: '09:00', close: '17:00' },
      thursday: { open: '09:00', close: '17:00' },
      friday: { open: '09:00', close: '17:00' },
      saturday: { open: '', close: '' },
      sunday: { open: '', close: '' }
    },
    image_url: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        ...formData,
        building_type: buildingType,
        latitude: parseFloat(formData.latitude) || null,
        longitude: parseFloat(formData.longitude) || null
      });
      toast.success('Location saved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/20 backdrop-blur-md rounded-lg shadow-sm p-6 border border-white/30">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Latitude</label>
            <input
              type="number"
              step="any"
              name="latitude"
              value={formData.latitude}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Longitude</label>
            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Number</label>
            <input
              type="tel"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Website URL</label>
            <input
              type="url"
              name="website_url"
              value={formData.website_url}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
            />
          </div>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
          />
        </div>

        {additionalFields}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : 'Save Location'}
          </button>
        </div>
      </form>
    </div>
  );
};
