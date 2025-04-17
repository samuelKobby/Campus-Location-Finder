import React, { useState, useEffect } from 'react';
import { Trophy, XCircle, Eye, Search, RefreshCw, Plus, MapPin, Clock, Image as ImageIcon, Pencil, Trash2, Users, Dumbbell, Calendar, CheckCircle, History } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useModal } from '../../../contexts/ModalContext';

interface SportsFacility {
  id: string;
  name: string;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  contact_number?: string;
  email?: string;
  website_url?: string;
  image?: string;
  sports_facilities: {
    sports_type: string[];
    capacity: number;
    operating_hours: string;
  };
  created_at: string;
}

interface NewSportsFacility {
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  contact_number: string;
  email: string;
  website_url: string;
  image: string;
  sports_type: string[];
  capacity: number;
  operating_hours: string;
}

interface ActivityLog {
  id: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  details: any;
  created_at: string;
}

export const SportsFacilitiesManagement = () => {
  const { setModalOpen } = useModal();
  const [facilities, setFacilities] = useState<SportsFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState<SportsFacility | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [newFacility, setNewFacility] = useState<NewSportsFacility>({
    name: '',
    description: '',
    address: '',
    latitude: 0,
    longitude: 0,
    contact_number: '',
    email: '',
    website_url: '',
    image: '',
    sports_type: [],
    capacity: 0,
    operating_hours: ''
  });

  useEffect(() => {
    fetchFacilities();
  }, []);

  useEffect(() => {
    setModalOpen(showAddModal || showDetailsModal || showActivityModal);
  }, [showAddModal, showDetailsModal, showActivityModal, setModalOpen]);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('locations')
        .select(`
          *,
          sports_facilities(*)
        `)
        .eq('building_type', 'sports')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFacilities(data || []);
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching sports facilities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFacilityActivity = async (facilityId: string) => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('entity_type', 'sports_facility')
        .eq('entity_id', facilityId)
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

  const updateFacilityStatus = async (facilityId: string, status: boolean) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('locations')
        .update({ available: status })
        .eq('id', facilityId);

      if (error) throw error;

      await supabase.from('activity_logs').insert({
        action_type: status ? 'facility_activated' : 'facility_deactivated',
        entity_type: 'sports_facility',
        entity_id: facilityId,
        details: { timestamp: new Date().toISOString() }
      });

      await fetchFacilities();
      toast.success(`Facility ${status ? 'activated' : 'deactivated'} successfully`);
    } catch (error: any) {
      setError(error.message);
      toast.error('Error updating facility status');
    }
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
      const fileName = `sports-facility-${Math.random()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from('pharmacy-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pharmacy-images')
        .getPublicUrl(fileName);

      setNewFacility(prev => ({
        ...prev,
        image: publicUrl
      }));
    } catch (error: any) {
      setError('Error uploading image: ' + error.message);
      console.error('Error uploading image:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Basic validation
      if (!newFacility.name || !newFacility.address || !newFacility.contact_number || 
          typeof newFacility.latitude !== 'number' || typeof newFacility.longitude !== 'number') {
        throw new Error('Please fill in all required fields including valid coordinates');
      }

      // Format the data for locations table
      const locationData = {
        name: newFacility.name,
        description: newFacility.description || '',
        address: newFacility.address,
        latitude: Number(newFacility.latitude),
        longitude: Number(newFacility.longitude),
        contact_number: newFacility.contact_number,
        email: newFacility.email || null,
        website_url: newFacility.website_url || null,
        image: newFacility.image || null,
        building_type: 'sports_facility',
        status: 'active'
      };

      let data;
      if (editMode) {
        // Update existing location
        const { data: updateData, error } = await supabase
          .from('locations')
          .update(locationData)
          .eq('id', editMode)
          .select();

        if (error) throw error;
        data = updateData;
      } else {
        // Insert new location
        const { data: insertData, error } = await supabase
          .from('locations')
          .insert([locationData])
          .select();

        if (error) throw error;
        data = insertData;
      }

      toast.success(editMode ? 'Sports facility updated successfully!' : 'Sports facility added successfully!');
      setShowAddModal(false);
      fetchFacilities(); // Refresh the list
      
      // Reset form
      setNewFacility({
        name: '',
        description: '',
        address: '',
        latitude: 0,
        longitude: 0,
        contact_number: '',
        email: '',
        website_url: '',
        image: '',
        sports_type: [],
        capacity: 0,
        operating_hours: ''
      });
      setPreviewImage(null);
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (facility: SportsFacility) => {
    setEditMode(facility.id);
    setNewFacility({
      name: facility.name,
      description: facility.description || '',
      address: facility.address,
      latitude: facility.latitude,
      longitude: facility.longitude,
      contact_number: facility.contact_number || '',
      email: facility.email || '',
      website_url: facility.website_url || '',
      image: facility.image || '',
      sports_type: facility.sports_facilities.sports_type,
      capacity: facility.sports_facilities.capacity,
      operating_hours: facility.sports_facilities.operating_hours
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this sports facility?')) {
      try {
        const { error } = await supabase
          .from('locations')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        toast.success('Sports facility deleted successfully');
        await fetchFacilities();
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Sports Facilities Management</h1>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search facilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <button
              onClick={() => fetchFacilities()}
              className="p-2 text-gray-600 hover:text-gray-900"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Facility
          </button>
        </div>
      </div>

      {/* Facilities List */}
      <div className="overflow-x-auto rounded-lg">
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
                Sports
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredFacilities.map((facility) => (
              <tr key={facility.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {facility.image ? (
                        <img
                          src={facility.image}
                          alt={facility.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <Trophy className="h-10 w-10 text-gray-400" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{facility.name}</div>
                      <div className="text-sm text-gray-500">{facility.address}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{facility.contact_number}</div>
                  <div className="text-sm text-gray-500">{facility.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Sports Facility</div>
                  <div className="text-sm text-gray-500">Capacity: N/A</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedFacility(facility);
                      setShowDetailsModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 mx-2"
                    title="View Details"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleEdit(facility)}
                    className="text-blue-600 hover:text-blue-900 mx-2"
                    title="Edit Facility"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(facility.id)}
                    className="text-red-600 hover:text-red-900 mx-2"
                    title="Delete Facility"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => fetchFacilityActivity(facility.id)}
                    className="text-blue-600 hover:text-blue-900 mx-2"
                    title="View Activity Logs"
                  >
                    <History className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Activity Logs Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-[60]">
          <div className="relative min-h-screen py-6 flex flex-col justify-center items-center">
            <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Activity History</h2>
                <button
                  onClick={() => setShowActivityModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                {activityLogs.map((log) => (
                  <div key={log.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <History className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {log.action_type.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Sports Facility Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-[60]">
          <div className="relative min-h-screen py-6 flex flex-col justify-center items-center">
            <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-xl font-semibold text-gray-900">{editMode ? 'Edit Sports Facility' : 'Add New Sports Facility'}</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditMode(null);
                  }}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facility Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newFacility.name}
                    onChange={(e) => setNewFacility(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Enter facility name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newFacility.description}
                    onChange={(e) => setNewFacility(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter facility description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newFacility.address}
                    onChange={(e) => setNewFacility(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Enter address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coordinates <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 flex gap-2 items-center">
                    <input
                      type="text"
                      value={newFacility.latitude && newFacility.longitude ? `${newFacility.latitude}, ${newFacility.longitude}` : ''}
                      onChange={(e) => {
                        const coords = e.target.value.split(',').map(c => parseFloat(c.trim()));
                        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                          setNewFacility(prev => ({
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
                    value={newFacility.contact_number}
                    onChange={(e) => setNewFacility(prev => ({ ...prev, contact_number: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newFacility.email}
                    onChange={(e) => setNewFacility(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={newFacility.website_url}
                    onChange={(e) => setNewFacility(prev => ({ ...prev, website_url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter website URL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facility Image
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
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      <ImageIcon className="h-5 w-5 mr-2 text-gray-400" />
                      Upload Image
                    </label>
                  </div>
                  {previewImage && (
                    <div className="mt-2 relative">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="h-32 w-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setPreviewImage(null);
                          setNewFacility(prev => ({ ...prev, image: '' }));
                        }}
                        className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditMode(null);
                      setNewFacility({
                        name: '',
                        description: '',
                        address: '',
                        latitude: 0,
                        longitude: 0,
                        contact_number: '',
                        email: '',
                        website_url: '',
                        image: '',
                        sports_type: [],
                        capacity: 0,
                        operating_hours: ''
                      });
                      setPreviewImage(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editMode ? 'Update Facility' : 'Add Facility'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Facility Details Modal */}
      {showDetailsModal && selectedFacility && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-[60]">
          <div className="relative min-h-screen py-6 flex flex-col justify-center items-center">
            <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Sports Facility Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Trophy className="w-5 h-5 mr-2" />
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-base text-gray-900">{selectedFacility.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Description</p>
                      <p className="text-base text-gray-900">{selectedFacility.description || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <p className="text-base text-gray-900">{selectedFacility.address}</p>
                      {selectedFacility.latitude && selectedFacility.longitude && (
                        <div className="mt-1 flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-500">
                            {selectedFacility.latitude.toFixed(6)}, {selectedFacility.longitude.toFixed(6)}
                          </p>
                          <button 
                            onClick={() => window.open(`https://www.google.com/maps?q=${selectedFacility.latitude},${selectedFacility.longitude}`, '_blank')}
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                          >
                            View on Map
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-base text-gray-900">{selectedFacility.contact_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-base text-gray-900">{selectedFacility.email || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500">Website</p>
                      {selectedFacility.website_url ? (
                        <a 
                          href={selectedFacility.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base text-blue-600 hover:text-blue-800 underline"
                        >
                          {selectedFacility.website_url}
                        </a>
                      ) : (
                        <p className="text-base text-gray-900">N/A</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Image Section */}
                {selectedFacility.image && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <ImageIcon className="w-5 h-5 mr-2" />
                      Facility Image
                    </h3>
                    <img
                      src={selectedFacility.image}
                      alt={selectedFacility.name}
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
    </div>
  );
};
