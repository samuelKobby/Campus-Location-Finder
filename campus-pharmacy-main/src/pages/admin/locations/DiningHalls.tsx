import React, { useState, useEffect } from 'react';
import { Utensils, XCircle, Eye, Search, RefreshCw, Plus, MapPin, Clock, ImageIcon, Pencil, Trash2, Users, Coffee, Calendar, History, CheckCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useModal } from '../../../contexts/ModalContext';

interface DiningHall {
  id: string;
  name: string;
  description?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  contact_number?: string;
  email?: string;
  website_url?: string;
  image?: string;
  building_type: string;
  created_at: string;
}

interface NewDiningHall {
  id?: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  contact_number: string;
  email: string;
  website_url: string;
  image: string;
}

interface ActivityLog {
  id: string;
  entity_id: string;
  entity_type: string;
  action: string;
  changes: any;
  created_at: string;
  created_by?: string;
}

export const DiningHallsManagement = () => {
  const { setModalOpen } = useModal();
  const [halls, setHalls] = useState<DiningHall[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedHall, setSelectedHall] = useState<DiningHall | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [newHall, setNewHall] = useState<NewDiningHall>({
    name: '',
    description: '',
    address: '',
    latitude: 0,
    longitude: 0,
    contact_number: '',
    email: '',
    website_url: '',
    image: ''
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    setModalOpen(showAddModal || showDetailsModal || showActivityModal);
  }, [showAddModal, showDetailsModal, showActivityModal, setModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Prepare location data
      const locationData = {
        name: newHall.name,
        description: newHall.description,
        address: newHall.address,
        latitude: newHall.latitude,
        longitude: newHall.longitude,
        contact_number: newHall.contact_number,
        email: newHall.email,
        website_url: newHall.website_url,
        image: newHall.image || null,
        building_type: 'dining'
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

      toast.success(editMode ? 'Dining hall updated successfully!' : 'Dining hall added successfully!');
      setShowAddModal(false);
      fetchHalls(); // Refresh the list
      
      // Reset form
      setNewHall({
        name: '',
        description: '',
        address: '',
        latitude: 0,
        longitude: 0,
        contact_number: '',
        email: '',
        website_url: '',
        image: ''
      });
      setPreviewImage(null);
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (hall: DiningHall) => {
    setEditMode(hall.id);
    setNewHall({
      name: hall.name,
      description: hall.description || '',
      address: hall.address,
      latitude: hall.latitude || 0,
      longitude: hall.longitude || 0,
      contact_number: hall.contact_number || '',
      email: hall.email || '',
      website_url: hall.website_url || '',
      image: hall.image || ''
    });
    setShowAddModal(true);
  };

  const fetchHalls = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('locations')
        .select('*')
        .eq('building_type', 'dining');

      if (fetchError) {
        console.error('Supabase error details:', fetchError);
        throw fetchError;
      }
      
      if (data) {
        console.log('Fetched data:', data);
        setHalls(data);
      }
    } catch (err: any) {
      console.error('Full error object:', err);
      toast.error(`Error fetching dining halls: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredHalls = halls.filter(hall => {
    const matchesSearch = hall.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hall.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch;
  });

  useEffect(() => {
    fetchHalls();
  }, []);

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
      const fileName = `dining-hall-${Math.random()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from('pharmacy-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pharmacy-images')
        .getPublicUrl(fileName);

      setNewHall(prev => ({
        ...prev,
        image: publicUrl
      }));
    } catch (error: any) {
      console.error('Error uploading image:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this dining hall?')) {
      try {
        const { error } = await supabase
          .from('locations')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast.success('Dining hall deleted successfully');
        fetchHalls(); // Refresh the list
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Utensils className="h-6 w-6" />
            Dining Halls Management
          </h1>
          <button
            onClick={() => {
              setShowAddModal(true);
              setEditMode(null);
              setNewHall({
                name: '',
                description: '',
                address: '',
                latitude: 0,
                longitude: 0,
                contact_number: '',
                email: '',
                website_url: '',
                image: ''
              });
              setPreviewImage(null);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add New Dining Hall
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search dining halls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHalls.map(hall => (
                  <tr key={hall.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {hall.image ? (
                          <img
                            src={hall.image}
                            alt={hall.name}
                            className="h-10 w-10 rounded-full object-cover mr-3"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <Utensils className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{hall.name}</div>
                          <div className="text-sm text-gray-500">{hall.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{hall.contact_number || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{hall.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        hall.building_type === 'dining'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {hall.building_type === 'dining' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setSelectedHall(hall);
                          setShowDetailsModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(hall)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(hall.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Dining Hall Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-[60]">
          <div className="relative min-h-screen py-6 flex flex-col justify-center items-center">
            <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-xl font-semibold text-gray-900">{editMode ? 'Edit Dining Hall' : 'Add New Dining Hall'}</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditMode(null);
                    setNewHall({
                      name: '',
                      description: '',
                      address: '',
                      latitude: 0,
                      longitude: 0,
                      contact_number: '',
                      email: '',
                      website_url: '',
                      image: ''
                    });
                    setPreviewImage(null);
                  }}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hall Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newHall.name}
                    onChange={(e) => setNewHall(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Enter dining hall name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newHall.description}
                    onChange={(e) => setNewHall(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter hall description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newHall.address}
                    onChange={(e) => setNewHall(prev => ({ ...prev, address: e.target.value }))}
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
                      value={newHall.latitude && newHall.longitude ? `${newHall.latitude}, ${newHall.longitude}` : ''}
                      onChange={(e) => {
                        const coords = e.target.value.split(',').map(c => parseFloat(c.trim()));
                        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                          setNewHall(prev => ({
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
                    value={newHall.contact_number}
                    onChange={(e) => setNewHall(prev => ({ ...prev, contact_number: e.target.value }))}
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
                    value={newHall.email}
                    onChange={(e) => setNewHall(prev => ({ ...prev, email: e.target.value }))}
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
                    value={newHall.website_url}
                    onChange={(e) => setNewHall(prev => ({ ...prev, website_url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter website URL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hall Image
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
                          setNewHall(prev => ({ ...prev, image: '' }));
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
                      setNewHall({
                        name: '',
                        description: '',
                        address: '',
                        latitude: 0,
                        longitude: 0,
                        contact_number: '',
                        email: '',
                        website_url: '',
                        image: ''
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
                    {loading ? 'Saving...' : editMode ? 'Update Hall' : 'Add Hall'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedHall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-[60]">
          <div className="relative min-h-screen py-6 flex flex-col justify-center items-center">
            <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-xl font-semibold text-gray-900">Dining Hall Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedHall.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Description</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedHall.description}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-500">Address</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedHall.address}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-500">Coordinates</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedHall.latitude}, {selectedHall.longitude}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Phone</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedHall.contact_number}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedHall.email}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-500">Website</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedHall.website_url ? (
                          <a
                            href={selectedHall.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {selectedHall.website_url}
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Image */}
                {selectedHall.image && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Dining Hall Image</h3>
                    <img
                      src={selectedHall.image}
                      alt={selectedHall.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Logs Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-[60]">
          <div className="relative min-h-screen py-6 flex flex-col justify-center items-center">
            <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-xl font-semibold text-gray-900">Activity Log</h3>
                <button
                  onClick={() => setShowActivityModal(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {activityLogs.map((log) => (
                  <div key={log.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{log.action}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      {log.created_by && (
                        <p className="text-xs text-gray-500">By: {log.created_by}</p>
                      )}
                    </div>
                    {log.changes && (
                      <div className="mt-2">
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                          {JSON.stringify(log.changes, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
