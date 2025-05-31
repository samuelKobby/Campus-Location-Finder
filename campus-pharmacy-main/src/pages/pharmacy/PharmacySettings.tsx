import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Settings, Save, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PharmacySettings {
  name: string;
  location: string;
  phone: string;
  description: string;
  latitude: number;
  longitude: number;
}

export const PharmacySettings: React.FC = () => {
  const [settings, setSettings] = useState<PharmacySettings>({
    name: '',
    location: '',
    phone: '',
    description: '',
    latitude: 0,
    longitude: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const pharmacyId = localStorage.getItem('pharmacyId');
      const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .eq('id', pharmacyId)
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const pharmacyId = localStorage.getItem('pharmacyId');
      const { error } = await supabase
        .from('pharmacies')
        .update(settings)
        .eq('id', pharmacyId);

      if (error) throw error;
      toast.success('Settings updated successfully');
      // Update pharmacy name in localStorage if it changed
      localStorage.setItem('pharmacyName', settings.name);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleLocationSelect = () => {
    // Open Google Maps in a new window for location selection
    const mapWindow = window.open(
      `https://www.google.com/maps?q=${settings.latitude},${settings.longitude}&z=15`,
      '_blank'
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <button
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Save className="h-5 w-5 mr-2" />
          Save Changes
        </button>
      </div>

      <div className="mt-8 max-w-3xl">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Pharmacy Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    id="location"
                    value={settings.location}
                    onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                    className="flex-1 block w-full rounded-none rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleLocationSelect}
                    className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:text-gray-700"
                  >
                    <MapPin className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                    Latitude
                  </label>
                  <input
                    type="number"
                    id="latitude"
                    value={settings.latitude}
                    onChange={(e) => setSettings({ ...settings, latitude: parseFloat(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    step="any"
                  />
                </div>

                <div>
                  <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                    Longitude
                  </label>
                  <input
                    type="number"
                    id="longitude"
                    value={settings.longitude}
                    onChange={(e) => setSettings({ ...settings, longitude: parseFloat(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    step="any"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
