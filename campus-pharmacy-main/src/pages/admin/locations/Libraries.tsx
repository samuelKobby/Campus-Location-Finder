import React, { useState, useEffect } from 'react';
import { Book, CheckCircle, XCircle, Mail, Eye, History, AlertTriangle, Search, RefreshCw, Plus, MapPin, Clock, Image as ImageIcon, Pencil, Trash2, Users, BookOpen, Bookmark, Store } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useModal } from '../../../contexts/ModalContext';

interface Library {
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
  libraries?: {
    opening_hours: string;
  };
}

interface ActivityLog {
  id: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  details: any;
  created_at: string;
}

interface NewLibrary {
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  contact_number: string;
  email: string;
  website_url: string;
  image: string;
  opening_hours: string;
}

export const LibrariesManagement = () => {
  const { setModalOpen } = useModal();
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [newLibrary, setNewLibrary] = useState<NewLibrary>({
    name: '',
    description: '',
    address: '',
    latitude: 0,
    longitude: 0,
    contact_number: '',
    email: '',
    website_url: '',
    image: '',
    opening_hours: ''
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
        name: newLibrary.name,
        description: newLibrary.description,
        address: newLibrary.address,
        latitude: newLibrary.latitude,
        longitude: newLibrary.longitude,
        contact_number: newLibrary.contact_number,
        email: newLibrary.email,
        website_url: newLibrary.website_url,
        image: newLibrary.image || null,
        building_type: 'library'
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

        // Update library details
        const { error: libraryError } = await supabase
          .from('libraries')
          .update({
            opening_hours: newLibrary.opening_hours
          })
          .eq('location_id', editMode);

        if (libraryError) throw libraryError;
      } else {
        // Insert new location
        const { data: insertData, error } = await supabase
          .from('locations')
          .insert([locationData])
          .select();

        if (error) throw error;
        data = insertData;

        // Insert library details
        const { error: libraryError } = await supabase
          .from('libraries')
          .insert([{
            location_id: data[0].id,
            opening_hours: newLibrary.opening_hours
          }]);

        if (libraryError) throw libraryError;
      }

      toast.success(editMode ? 'Library updated successfully!' : 'Library added successfully!');
      setShowAddModal(false);
      fetchLibraries(); // Refresh the list
      
      // Reset form
      setNewLibrary({
        name: '',
        description: '',
        address: '',
        latitude: 0,
        longitude: 0,
        contact_number: '',
        email: '',
        website_url: '',
        image: '',
        opening_hours: ''
      });
      setPreviewImage(null);
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (libraryId: string) => {
    if (window.confirm('Are you sure you want to delete this library?')) {
      try {
        setLoading(true);
        const { error } = await supabase
          .from('locations')
          .delete()
          .eq('id', libraryId);

        if (error) throw error;

        await supabase.from('activity_logs').insert({
          action_type: 'delete_library',
          entity_type: 'library',
          entity_id: libraryId,
          details: { deleted: true }
        });

        toast.success('Library deleted successfully');
        fetchLibraries();
      } catch (error: any) {
        toast.error('Failed to delete library');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (library: Library) => {
    setEditMode(library.id);
    setNewLibrary({
      name: library.name,
      description: library.description || '',
      address: library.address,
      latitude: library.latitude || 0,
      longitude: library.longitude || 0,
      contact_number: library.contact_number || '',
      email: library.email || '',
      website_url: library.website_url || '',
      image: library.image || '',
      opening_hours: library.libraries?.opening_hours || ''
    });
    setShowAddModal(true);
  };

  const fetchLibraries = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('locations')
        .select('*')
        .eq('building_type', 'library');

      if (fetchError) throw fetchError;
      
      if (data) {
        setLibraries(data);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredLibraries = libraries.filter(library => {
    const matchesSearch = library.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      library.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch;
  });

  useEffect(() => {
    fetchLibraries();
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
      const fileName = `library-${Math.random()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from('pharmacy-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pharmacy-images')
        .getPublicUrl(fileName);

      setNewLibrary(prev => ({
        ...prev,
        image: publicUrl
      }));
    } catch (error: any) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Libraries Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-5 h-5 inline-block mr-2" />
          Add New Library
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center space-x-4 flex-grow">
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                placeholder="Search libraries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Libraries</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button
            onClick={fetchLibraries}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>

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
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLibraries.map((library) => (
                <tr key={library.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {library.image ? (
                          <img className="h-10 w-10 rounded-full" src={library.image} alt="" />
                        ) : (
                          <Store className="h-10 w-10 text-gray-400" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{library.name}</div>
                        <div className="text-sm text-gray-500">{library.address}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{library.contact_number}</div>
                    <div className="text-sm text-gray-500">{library.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedLibrary(library);
                        setShowDetailsModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mx-2"
                      title="View Details"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(library)}
                      className="text-blue-600 hover:text-blue-900 mx-2"
                      title="Edit Library"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(library.id)}
                      className="text-red-600 hover:text-red-900 mx-2"
                      title="Delete Library"
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

      {/* Library Details Modal */}
      {showDetailsModal && selectedLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-[60]">
          <div className="relative min-h-screen py-6 flex flex-col justify-center items-center">
            <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Library Details</h2>
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
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedLibrary.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedLibrary.address}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedLibrary.description || 'No description available'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Latitude</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedLibrary.latitude || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Longitude</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedLibrary.longitude || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Library Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Library Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Opening Hours</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedLibrary.libraries?.opening_hours || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedLibrary.contact_number || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedLibrary.email || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Website</label>
                      {selectedLibrary.website_url ? (
                        <a
                          href={selectedLibrary.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          {selectedLibrary.website_url}
                        </a>
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">N/A</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Library Image */}
                {selectedLibrary.image && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Library Image</h3>
                    <img
                      src={selectedLibrary.image}
                      alt={selectedLibrary.name}
                      className="w-full max-w-md rounded-lg object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Logs Modal */}
      {showActivityModal && selectedLibrary && (
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

      {/* Add/Edit Library Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-[60]">
          <div className="relative min-h-screen py-6 flex flex-col justify-center items-center">
            <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-xl font-semibold text-gray-900">{editMode ? 'Edit Library' : 'Add New Library'}</h3>
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
                    Library Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newLibrary.name}
                    onChange={(e) => setNewLibrary(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Enter library name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newLibrary.description}
                    onChange={(e) => setNewLibrary(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter library description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newLibrary.address}
                    onChange={(e) => setNewLibrary(prev => ({ ...prev, address: e.target.value }))}
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
                      value={newLibrary.latitude && newLibrary.longitude ? `${newLibrary.latitude}, ${newLibrary.longitude}` : ''}
                      onChange={(e) => {
                        const coords = e.target.value.split(',').map(c => parseFloat(c.trim()));
                        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                          setNewLibrary(prev => ({
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
                    value={newLibrary.contact_number}
                    onChange={(e) => setNewLibrary(prev => ({ ...prev, contact_number: e.target.value }))}
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
                    value={newLibrary.email}
                    onChange={(e) => setNewLibrary(prev => ({ ...prev, email: e.target.value }))}
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
                    value={newLibrary.website_url}
                    onChange={(e) => setNewLibrary(prev => ({ ...prev, website_url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter website URL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opening Hours
                  </label>
                  <input
                    type="text"
                    value={newLibrary.opening_hours}
                    onChange={(e) => setNewLibrary(prev => ({ ...prev, opening_hours: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter opening hours"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Library Image
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
                          setNewLibrary(prev => ({ ...prev, image: '' }));
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
                    {loading ? 'Saving...' : editMode ? 'Update Library' : 'Add Library'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibrariesManagement;
