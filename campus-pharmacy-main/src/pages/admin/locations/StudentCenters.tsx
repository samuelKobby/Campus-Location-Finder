import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import { useModal } from '../../../contexts/ModalContext';
import { MapPin, ImageIcon, XCircle, BuildingIcon } from 'lucide-react';

interface StudentCenter {
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
  student_centers: {
    facilities: string[];
    capacity: number;
    operating_hours: string;
  };
  created_at: string;
}

interface NewStudentCenter {
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  contact_number: string;
  email: string;
  website_url: string;
  image: string;
  facilities: string[];
  capacity: number;
  operating_hours: string;
}

export const StudentCentersManagement = () => {
  const { setModalOpen } = useModal();
  const [centers, setCenters] = useState<StudentCenter[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<StudentCenter | null>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [newCenter, setNewCenter] = useState<NewStudentCenter>({
    name: '',
    description: '',
    address: '',
    latitude: 0,
    longitude: 0,
    contact_number: '',
    email: '',
    website_url: '',
    image: '',
    facilities: [],
    capacity: 0,
    operating_hours: ''
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    fetchCenters();
  }, []);

  useEffect(() => {
    setModalOpen(showAddModal || showDetailsModal || showActivityModal);
  }, [showAddModal, showDetailsModal, showActivityModal, setModalOpen]);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('locations')
        .select('*')
        .eq('building_type', 'student_center');

      if (fetchError) throw fetchError;
      
      if (data) {
        setCenters(data);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Prepare location data
      const locationData = {
        name: newCenter.name,
        description: newCenter.description,
        address: newCenter.address,
        latitude: newCenter.latitude,
        longitude: newCenter.longitude,
        contact_number: newCenter.contact_number,
        email: newCenter.email,
        website_url: newCenter.website_url,
        image: newCenter.image || null,
        building_type: 'student_center'
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

      toast.success(editMode ? 'Student center updated successfully!' : 'Student center added successfully!');
      setShowAddModal(false);
      fetchCenters(); // Refresh the list
      
      // Reset form
      setNewCenter({
        name: '',
        description: '',
        address: '',
        latitude: 0,
        longitude: 0,
        contact_number: '',
        email: '',
        website_url: '',
        image: '',
        facilities: [],
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

  const handleEdit = (center: StudentCenter) => {
    setEditMode(center.id);
    setNewCenter({
      name: center.name,
      description: center.description || '',
      address: center.address,
      latitude: center.latitude,
      longitude: center.longitude,
      contact_number: center.contact_number || '',
      email: center.email || '',
      website_url: center.website_url || '',
      image: center.image || '',
      facilities: center.student_centers.facilities,
      capacity: center.student_centers.capacity,
      operating_hours: center.student_centers.operating_hours
    });
    setShowAddModal(true);
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
      const fileName = `student-center-${Math.random()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from('pharmacy-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pharmacy-images')
        .getPublicUrl(fileName);

      setNewCenter(prev => ({
        ...prev,
        image: publicUrl
      }));
    } catch (error: any) {
      toast.error('Error uploading image: ' + error.message);
      console.error('Error uploading image:', error);
    }
  };

  const filteredCenters = centers.filter(center => {
    const matchesSearch = center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Student Centers Management</h1>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search centers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => fetchCenters()}
              className="p-2 text-gray-600 hover:text-gray-900"
              title="Refresh"
            >
            </button>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
          >
          </button>
        </div>
      </div>

      {/* Centers List */}
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
                Facilities
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCenters.map((center) => (
              <tr key={center.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {center.image ? (
                      <img
                        src={center.image}
                        alt={center.name}
                        className="h-10 w-10 rounded-full object-cover mr-3"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        <BuildingIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{center.name}</div>
                      <div className="text-sm text-gray-500">{center.address}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{center.contact_number}</div>
                  <div className="text-sm text-gray-500">{center.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Facilities</div>
                  <div className="text-sm text-gray-500">Event Spaces</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedCenter(center);
                      setShowDetailsModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 mx-2"
                    title="View Details"
                  >
                  </button>
                  <button
                    onClick={() => handleEdit(center)}
                    className="text-blue-600 hover:text-blue-900 mx-2"
                    title="Edit Center"
                  >
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Student Center Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-[60]">
          <div className="relative min-h-screen py-6 flex flex-col justify-center items-center">
            <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-xl font-semibold text-gray-900">{editMode ? 'Edit Student Center' : 'Add New Student Center'}</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditMode(null);
                  }}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                </button>
              </div>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Center Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCenter.name}
                    onChange={(e) => setNewCenter(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Enter student center name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newCenter.description}
                    onChange={(e) => setNewCenter(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter center description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCenter.address}
                    onChange={(e) => setNewCenter(prev => ({ ...prev, address: e.target.value }))}
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
                      value={newCenter.latitude && newCenter.longitude ? `${newCenter.latitude}, ${newCenter.longitude}` : ''}
                      onChange={(e) => {
                        const coords = e.target.value.split(',').map(c => parseFloat(c.trim()));
                        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                          setNewCenter(prev => ({
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
                    value={newCenter.contact_number}
                    onChange={(e) => setNewCenter(prev => ({ ...prev, contact_number: e.target.value }))}
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
                    value={newCenter.email}
                    onChange={(e) => setNewCenter(prev => ({ ...prev, email: e.target.value }))}
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
                    value={newCenter.website_url}
                    onChange={(e) => setNewCenter(prev => ({ ...prev, website_url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter website URL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Center Image
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
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                          setNewCenter(prev => ({ ...prev, image: '' }));
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
                      setNewCenter({
                        name: '',
                        description: '',
                        address: '',
                        latitude: 0,
                        longitude: 0,
                        contact_number: '',
                        email: '',
                        website_url: '',
                        image: '',
                        facilities: [],
                        capacity: 0,
                        operating_hours: ''
                      });
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
                    {loading ? 'Saving...' : editMode ? 'Update Center' : 'Add Center'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Center Details Modal */}
      {showDetailsModal && selectedCenter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-[60]">
          <div className="relative min-h-screen py-6 flex flex-col justify-center items-center">
            <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Student Center Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-base text-gray-900">{selectedCenter.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Description</p>
                      <p className="text-base text-gray-900">{selectedCenter.description || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <p className="text-base text-gray-900">{selectedCenter.address}</p>
                      {selectedCenter.latitude && selectedCenter.longitude && (
                        <div className="mt-1 flex items-center space-x-2">
                          <img
                            src="https://via.placeholder.com/20"
                            alt="Map Pin"
                            className="w-4 h-4 text-gray-400"
                          />
                          <p className="text-sm text-gray-500">
                            {selectedCenter.latitude.toFixed(6)}, {selectedCenter.longitude.toFixed(6)}
                          </p>
                          <button 
                            onClick={() => window.open(`https://www.google.com/maps?q=${selectedCenter.latitude},${selectedCenter.longitude}`, '_blank')}
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
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-base text-gray-900">{selectedCenter.contact_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-base text-gray-900">{selectedCenter.email || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500">Website</p>
                      {selectedCenter.website_url ? (
                        <a 
                          href={selectedCenter.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base text-blue-600 hover:text-blue-800 underline"
                        >
                          {selectedCenter.website_url}
                        </a>
                      ) : (
                        <p className="text-base text-gray-900">N/A</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Image Section */}
                {selectedCenter.image && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Student Center Image</h3>
                    <img
                      src={selectedCenter.image}
                      alt={selectedCenter.name}
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

      {/* Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-[60]">
          <div className="relative min-h-screen py-6 flex flex-col justify-center items-center">
            <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
