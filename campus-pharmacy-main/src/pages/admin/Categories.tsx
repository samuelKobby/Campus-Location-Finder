import React, { useState, useEffect } from 'react';
import { Store, CheckCircle, XCircle, Mail, Eye, History, AlertTriangle, Search, RefreshCw, Plus, MapPin, Clock, Image as ImageIcon, Pencil, Trash2, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import type { Pharmacy, ActivityLog, PharmacyStatus } from '../../types/database';
import { toast } from 'react-hot-toast';
import { useModal } from '../../contexts/ModalContext';

interface NewPharmacy {
  id?: string;
  name: string;
  location: string;
  hours: string;
  phone: string;
  available: boolean;
  image: string;
  latitude: number;
  longitude: number;
  ownerName: string;
  email: string;
  licenseNumber: string;
}

export const PharmacyManagement: React.FC = () => {
  const { setModalOpen } = useModal();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [newPharmacy, setNewPharmacy] = useState<NewPharmacy>({
    name: '',
    location: '',
    hours: '',
    phone: '',
    available: true,
    image: '',
    latitude: 0,
    longitude: 0,
    ownerName: '',
    email: '',
    licenseNumber: ''
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [editPharmacy, setEditPharmacy] = useState<string | null>(null);

  // Update modal state whenever any modal opens/closes
  useEffect(() => {
    setModalOpen(showAddModal || showDetailsModal || showActivityModal);
  }, [showAddModal, showDetailsModal, showActivityModal, setModalOpen]);

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: pharmaciesData, error } = await supabase
        .from('pharmacies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPharmacies(pharmaciesData || []);
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching pharmacies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPharmacyActivity = async (pharmacyId: string) => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('entity_type', 'pharmacy')
        .eq('entity_id', pharmacyId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setActivityLogs(data || []);
      setShowActivityModal(true);
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching activity logs:', error);
    }
  };

  const updatePharmacyStatus = async (pharmacyId: string) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('pharmacies')
        .update({ 
          available: true
        })
        .eq('id', pharmacyId);

      if (error) throw error;

      await supabase.from('activity_logs').insert({
        action_type: 'pharmacy_updated',
        entity_type: 'pharmacy',
        entity_id: pharmacyId,
        details: { timestamp: new Date().toISOString() }
      });

      await fetchPharmacies();
    } catch (error: any) {
      setError(error.message);
      console.error('Error updating pharmacy:', error);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setNewPharmacy(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
    setShowMapModal(false);
  };

  const handleMapClick = () => {
    // Open Google Maps in a new window
    const mapUrl = `https://www.google.com/maps?q=5.6505,-0.1962&z=15&output=embed`;
    window.open(mapUrl, 'GoogleMaps', 'width=800,height=600');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from('pharmacy-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pharmacy-images')
        .getPublicUrl(fileName);

      setNewPharmacy(prev => ({
        ...prev,
        image: publicUrl
      }));
    } catch (error: any) {
      setError('Error uploading image: ' + error.message);
      console.error('Error uploading image:', error);
    }
  };

  const addNewPharmacy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setLoading(true);

      // Basic validation
      if (!newPharmacy.name || !newPharmacy.phone || !newPharmacy.hours) {
        throw new Error('Please fill in all required fields');
      }

      if (!newPharmacy.location && (!newPharmacy.latitude || !newPharmacy.longitude)) {
        throw new Error('Please provide location details');
      }

      // Format the data to match the table schema
      const pharmacyData = {
        name: newPharmacy.name,
        location: newPharmacy.location,
        hours: newPharmacy.hours,
        phone: newPharmacy.phone,
        available: newPharmacy.available,
        image: newPharmacy.image || null,
        latitude: newPharmacy.latitude,
        longitude: newPharmacy.longitude,
        
      };

      console.log('Attempting to insert pharmacy with data:', JSON.stringify(pharmacyData, null, 2));

      if (editPharmacy) {
        // Update existing pharmacy
        const { error } = await supabase
          .from('pharmacies')
          .update(pharmacyData)
          .eq('id', editPharmacy);

        if (error) throw error;
        toast.success('Pharmacy updated successfully');
      } else {
        // Add new pharmacy
        const { data, error } = await supabase
          .from('pharmacies')
          .insert(pharmacyData)
          .select()
          .single();

        if (error) throw error;
        toast.success('Pharmacy added successfully');
      }

      // Reset form and close modal
      setNewPharmacy({
        name: '',
        location: '',
        hours: '',
        phone: '',
        available: true,
        image: '',
        latitude: 0,
        longitude: 0,
        ownerName: '',
        email: '',
        licenseNumber: ''
      });
      setEditPharmacy(null);
      setPreviewImage(null);
      setShowAddModal(false);

      // Refresh the pharmacy list
      await fetchPharmacies();

    } catch (error: any) {
      setError(error.message);
      console.error('Error adding/updating pharmacy:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePharmacy = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this pharmacy?')) return;
    
    try {
      const { error } = await supabase
        .from('pharmacies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh the list
      await fetchPharmacies();
      toast.success('Pharmacy deleted successfully');
    } catch (error: any) {
      console.error('Error deleting pharmacy:', error);
      toast.error('Error deleting pharmacy: ' + error.message);
    }
  };

  const handleEditPharmacy = (pharmacy: any) => {
    setEditPharmacy(pharmacy.id);
    setNewPharmacy({
      name: pharmacy.name,
      location: pharmacy.location,
      hours: pharmacy.hours,
      phone: pharmacy.phone,
      available: pharmacy.available,
      image: pharmacy.image || '',
      latitude: pharmacy.latitude,
      longitude: pharmacy.longitude,
      ownerName: pharmacy.ownerName,
      email: pharmacy.email,
      licenseNumber: pharmacy.licenseNumber
    });
    setShowAddModal(true);
  };

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const filterPharmacies = (pharmacies: Pharmacy[]) => {
    return pharmacies.filter(pharmacy => {
      const matchesSearch = pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pharmacy.location.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch && (filter === 'all' || 
        (filter === 'active' && pharmacy.available) || 
        (filter === 'inactive' && !pharmacy.available));
    });
  };

  const getAvailabilityBadgeClass = (available: boolean | undefined) => {    
    if (available) {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const formatAvailability = (available: boolean | undefined) => {
    return available ? 'Active' : 'Inactive';
  };

  const filteredPharmacies = filterPharmacies(pharmacies);

  return (
    <div className="space-y-6 p-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pharmacy Management</h2>
          <p className="text-gray-600 mt-1">Manage and monitor registered pharmacies</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search pharmacies..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'inactive')}
          >
            <option value="all">All Pharmacies</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Pharmacy
          </button>
          <button
            onClick={fetchPharmacies}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading pharmacies...</p>
          </div>
        ) : filteredPharmacies.length === 0 ? (
          <div className="p-8 text-center">
            <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No pharmacies found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Availability
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPharmacies.map((pharmacy) => (
                  <tr key={pharmacy.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {pharmacy.image ? (
                            <img
                              src={pharmacy.image}
                              alt={pharmacy.name}
                              className="h-10 w-10 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.onerror = null;
                              }}
                            />
                          ) : (
                            <Store className="h-10 w-10 text-gray-400" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{pharmacy.name}</div>
                          <div className="text-sm text-gray-500">{pharmacy.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{pharmacy.phone}</div>
                      <div className="text-sm text-gray-500">{pharmacy.hours}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        pharmacy.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {pharmacy.available ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedPharmacy(pharmacy);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mx-2"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEditPharmacy(pharmacy)}
                        className="text-blue-600 hover:text-blue-900 mx-2"
                        title="Edit Pharmacy"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeletePharmacy(pharmacy.id)}
                        className="text-red-600 hover:text-red-900 mx-2"
                        title="Delete Pharmacy"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Pharmacy Modal */}
      {showAddModal && (
        <div className="fixed inset-0 mt-0 bg-black bg-opacity-50 overflow-y-auto w-full z-50 flex items-center justify-center">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-xl font-semibold text-gray-900">{editPharmacy ? 'Edit Pharmacy' : 'Add New Pharmacy'}</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={addNewPharmacy} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pharmacy Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newPharmacy.name}
                  onChange={(e) => setNewPharmacy({ ...newPharmacy, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter pharmacy name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Open Hours
                </label>
                <input
                  type="text"
                  
                  value={newPharmacy.hours}
                  onChange={(e) => setNewPharmacy({ ...newPharmacy, hours: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Mon-Fri: 9AM-6PM, Sat: 9AM-2PM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex space-x-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newPharmacy.location}
                  onChange={(e) => setNewPharmacy({ ...newPharmacy, location: e.target.value })}
                  required
                  placeholder="Enter location or select on map"
                />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coordinates <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex gap-2 items-center">
                  <input
                    type="text"
                    value={newPharmacy.latitude && newPharmacy.longitude ? `${newPharmacy.latitude}, ${newPharmacy.longitude}` : ''}
                    onChange={(e) => {
                      const coords = e.target.value.split(',').map(c => parseFloat(c.trim()));
                      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                        setNewPharmacy(prev => ({
                          ...prev,
                          latitude: coords[0],
                          longitude: coords[1]
                        }));
                      }
                    }}
                    placeholder="Enter coordinates (e.g., 5.6505, -0.1962) or select from map"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <a 
                    href="#"
                    className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(`https://www.google.com/maps/@5.6505,-0.1962,15z`, 
                        'SelectLocation',
                        'width=800,height=600,scrollbars=yes'
                      );
                    }}
                  >
                    <MapPin className="h-5 w-5 text-gray-600" />
                  </a>
                </div>
                <small className="text-gray-500 mt-1 block">
                  Click "Select on Map" to choose location. Copy coordinates from the URL (format: @5.6505,-0.1962) and paste here.
                </small>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={newPharmacy.phone}
                  onChange={(e) => setNewPharmacy({ ...newPharmacy, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pharmacy Image
                </label>
                <div className="mt-1 flex items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <ImageIcon className="h-5 w-5 mr-2 text-gray-400" />
                    Upload Image
                  </label>
                </div>
                {previewImage && (
                  <div className="mt-2">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setPreviewImage(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  
                >
                  {editPharmacy ? 'Update Pharmacy' : 'Add Pharmacy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pharmacy Details Modal */}
      {showDetailsModal && selectedPharmacy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Pharmacy Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Pharmacy Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Store className="w-5 h-5 mr-2" />
                    Pharmacy Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-base text-gray-900">{selectedPharmacy.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <p className="text-base text-gray-900">{selectedPharmacy.location}</p>
                      {selectedPharmacy.latitude && selectedPharmacy.longitude && (
                        <div className="mt-1 flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-500">
                            {selectedPharmacy.latitude.toFixed(6)}, {selectedPharmacy.longitude.toFixed(6)}
                          </p>
                          <button 
                            onClick={() => window.open(`https://www.google.com/maps?q=${selectedPharmacy.latitude},${selectedPharmacy.longitude}`, '_blank')}
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                          >
                            View on Map
                          </button>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Operating Hours</p>
                      <p className="text-base text-gray-900">{selectedPharmacy.hours}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-base text-gray-900">{selectedPharmacy.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Image Section */}
                {selectedPharmacy.image && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <ImageIcon className="w-5 h-5 mr-2" />
                      Image
                    </h3>
                    <img
                      src={selectedPharmacy.image}
                      alt={selectedPharmacy.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Logs Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-xl font-semibold text-gray-900">Activity History</h3>
              <button
                onClick={() => setShowActivityModal(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {activityLogs.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No activity logs found</p>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="border-b border-gray-200 py-3 last:border-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">
                        {log.action_type.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(log.created_at), 'PPP p')}
                      </span>
                    </div>
                    {log.details && (
                      <p className="text-sm text-gray-600 mt-1">
                        {JSON.stringify(log.details, null, 2)}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { PharmacyManagement as Categories };