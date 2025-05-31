import React, { useState, useEffect } from 'react';
import { Store, CheckCircle, XCircle, Mail, Eye, History, AlertTriangle, Search, RefreshCw, Plus, MapPin, Clock, ImageIcon, Pencil, Trash2, School, Users, Building, Wrench, Accessibility } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useModal } from '../../../contexts/ModalContext';

interface AcademicBuilding {
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
  academic_buildings: {
    department: string;
    faculty_count: number;
    facilities: string[];
    accessibility_features: string[];
  };
  created_at: string;
}

interface NewAcademicBuilding {
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  contact_number: string;
  email: string;
  website_url: string;
  image: string;
  department: string;
  faculty_count: number;
  facilities: string[];
  accessibility_features: string[];
}

export const AcademicBuildingsManagement = () => {
  const { setModalOpen } = useModal();
  const [buildings, setBuildings] = useState<AcademicBuilding[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<AcademicBuilding | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [newBuilding, setNewBuilding] = useState<NewAcademicBuilding>({
    name: '',
    description: '',
    address: '',
    latitude: 0,
    longitude: 0,
    contact_number: '',
    email: '',
    website_url: '',
    image: '',
    department: '',
    faculty_count: 0,
    facilities: [],
    accessibility_features: []
  });

  // Update modal state whenever any modal opens/closes
  useEffect(() => {
    setModalOpen(showAddModal || showDetailsModal);
  }, [showAddModal, showDetailsModal, setModalOpen]);

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('locations')
        .select(`
          *,
          academic_buildings(*)
        `)
        .eq('building_type', 'academic')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to use image from academic_buildings
      const transformedData = data?.map(item => ({
        ...item,
        ...item.academic_buildings,
        image: item.image // Only use image from locations
      }));

      setBuildings(transformedData || []);
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching buildings:', error);
    } finally {
      setLoading(false);
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
      const fileName = `academic-${Math.random()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from('pharmacy-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pharmacy-images')
        .getPublicUrl(fileName);

      setNewBuilding(prev => ({
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
      if (!newBuilding.name || !newBuilding.address) {
        throw new Error('Please fill in all required fields');
      }

      // Format the data for locations table
      const locationData = {
        name: newBuilding.name,
        description: newBuilding.description,
        address: newBuilding.address,
        latitude: newBuilding.latitude,
        longitude: newBuilding.longitude,
        contact_number: newBuilding.contact_number,
        email: newBuilding.email,
        website_url: newBuilding.website_url,
        image: newBuilding.image || null,
        building_type: 'academic'
      };

      let locationId;

      if (editMode) {
        const { error } = await supabase
          .from('locations')
          .update(locationData)
          .eq('id', editMode);

        if (error) throw error;
        locationId = editMode;
        toast.success('Building updated successfully');
      } else {
        const { data, error } = await supabase
          .from('locations')
          .insert(locationData)
          .select()
          .single();

        if (error) throw error;
        locationId = data.id;
        toast.success('Building added successfully');
      }

      // Format the data for academic_buildings table
      const academicData = {
        id: locationId,
        department: newBuilding.department,
        faculty_count: newBuilding.faculty_count,
        facilities: newBuilding.facilities,
        accessibility_features: newBuilding.accessibility_features
      };

      if (editMode) {
        const { error } = await supabase
          .from('academic_buildings')
          .update(academicData)
          .eq('id', editMode);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('academic_buildings')
          .insert(academicData);
        if (error) throw error;
      }

      // Reset form
      setNewBuilding({
        name: '',
        description: '',
        address: '',
        latitude: 0,
        longitude: 0,
        contact_number: '',
        email: '',
        website_url: '',
        image: '',
        department: '',
        faculty_count: 0,
        facilities: [],
        accessibility_features: []
      });
      setPreviewImage(null);
      setShowAddModal(false);

      // Refresh the list
      await fetchBuildings();

    } catch (error: any) {
      setError(error.message);
      console.error('Error adding/updating building:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this building?')) return;
    
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Building deleted successfully');
      await fetchBuildings();
    } catch (error: any) {
      console.error('Error deleting building:', error);
      toast.error('Error deleting building: ' + error.message);
    }
  };

  const handleEdit = (building: AcademicBuilding) => {
    setEditMode(building.id);
    setNewBuilding({
      name: building.name,
      description: building.description || '',
      address: building.address,
      latitude: building.latitude || 0,
      longitude: building.longitude || 0,
      contact_number: building.contact_number || '',
      email: building.email || '',
      website_url: building.website_url || '',
      image: building.image || '',
      department: building.academic_buildings.department,
      faculty_count: building.academic_buildings.faculty_count,
      facilities: building.academic_buildings.facilities,
      accessibility_features: building.academic_buildings.accessibility_features
    });
    setShowAddModal(true);
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const filterBuildings = (buildings: AcademicBuilding[]) => {
    return buildings.filter(building => 
      building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      building.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      building.academic_buildings.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredBuildings = filterBuildings(buildings);

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
          <h2 className="text-2xl font-bold text-gray-800">Academic Buildings</h2>
          <p className="text-gray-600 mt-1">Manage and monitor academic buildings</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search buildings..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Building
          </button>
          <button
            onClick={fetchBuildings}
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
            <p className="mt-4 text-gray-600">Loading buildings...</p>
          </div>
        ) : filteredBuildings.length === 0 ? (
          <div className="p-8 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No buildings found</p>
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
                    Department
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBuildings.map((building) => (
                  <tr key={building.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {building.image ? (
                            <img
                              src={building.image}
                              alt={building.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <Building className="h-10 w-10 text-gray-400" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{building.name}</div>
                          <div className="text-sm text-gray-500">{building.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{building.contact_number}</div>
                      <div className="text-sm text-gray-500">{building.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{building.academic_buildings.department}</div>
                      <div className="text-sm text-gray-500">
                        {building.academic_buildings.faculty_count} Faculty Members
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedBuilding(building);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mx-2"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(building)}
                        className="text-blue-600 hover:text-blue-900 mx-2"
                        title="Edit Building"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(building.id)}
                        className="text-red-600 hover:text-red-900 mx-2"
                        title="Delete Building"
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

      {/* Add/Edit Building Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-xl font-semibold text-gray-900">
                {editMode ? 'Edit Building' : 'Add New Building'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditMode(null);
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
                  Building Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newBuilding.name}
                  onChange={(e) => setNewBuilding(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="Enter building name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newBuilding.description}
                  onChange={(e) => setNewBuilding(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter building description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newBuilding.address}
                  onChange={(e) => setNewBuilding(prev => ({ ...prev, address: e.target.value }))}
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
                    value={newBuilding.latitude && newBuilding.longitude ? `${newBuilding.latitude}, ${newBuilding.longitude}` : ''}
                    onChange={(e) => {
                      const coords = e.target.value.split(',').map(c => parseFloat(c.trim()));
                      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                        setNewBuilding(prev => ({
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
                    className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(`https://www.google.com/maps/@5.6505,-0.1962,15z`, 
                        'SelectLocation',
                        'width=800,height=600,scrollbars=yes'
                      );
                    }}
                  >
                    <MapPin className="h-5 w-5 mr-2 text-gray-400" />
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
                  value={newBuilding.contact_number}
                  onChange={(e) => setNewBuilding(prev => ({ ...prev, contact_number: e.target.value }))}
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
                  value={newBuilding.email}
                  onChange={(e) => setNewBuilding(prev => ({ ...prev, email: e.target.value }))}
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
                  value={newBuilding.website_url}
                  onChange={(e) => setNewBuilding(prev => ({ ...prev, website_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter website URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Building Image
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
                        setNewBuilding(prev => ({ ...prev, image: '' }));
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
                    setNewBuilding({
                      name: '',
                      description: '',
                      address: '',
                      latitude: 0,
                      longitude: 0,
                      contact_number: '',
                      email: '',
                      website_url: '',
                      image: '',
                      department: '',
                      faculty_count: 0,
                      facilities: [],
                      accessibility_features: []
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
                  {loading ? 'Saving...' : editMode ? 'Update Building' : 'Add Building'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Building Details Modal */}
      {showDetailsModal && selectedBuilding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Building Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Building Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Building Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-base text-gray-900">{selectedBuilding.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Description</p>
                      <p className="text-base text-gray-900">{selectedBuilding.description || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <p className="text-base text-gray-900">{selectedBuilding.address}</p>
                      {selectedBuilding.latitude && selectedBuilding.longitude && (
                        <div className="mt-1 flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-500">
                            {selectedBuilding.latitude.toFixed(6)}, {selectedBuilding.longitude.toFixed(6)}
                          </p>
                          <button 
                            onClick={() => window.open(`https://www.google.com/maps?q=${selectedBuilding.latitude},${selectedBuilding.longitude}`, '_blank')}
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
                      <p className="text-base text-gray-900">{selectedBuilding.contact_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-base text-gray-900">{selectedBuilding.email || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500">Website</p>
                      {selectedBuilding.website_url ? (
                        <a 
                          href={selectedBuilding.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base text-blue-600 hover:text-blue-800 underline"
                        >
                          {selectedBuilding.website_url}
                        </a>
                      ) : (
                        <p className="text-base text-gray-900">N/A</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Image Section */}
                {selectedBuilding.image && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <ImageIcon className="w-5 h-5 mr-2" />
                      Building Image
                    </h3>
                    <img
                      src={selectedBuilding.image}
                      alt={selectedBuilding.name}
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
