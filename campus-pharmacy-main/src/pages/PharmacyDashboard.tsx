import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { AddMedicineModal } from '../components/pharmacy/AddMedicineModal';

interface Medicine {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  quantity: number;
  available: boolean;
  image: string;
}

// Sample data for the pharmacy dashboard
const sampleMedicines: Medicine[] = [
  {
    id: '1',
    name: 'Paracetamol',
    description: 'Pain relief and fever reducer',
    price: 5.99,
    category: 'Pain Relief',
    quantity: 100,
    available: true,
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=500'
  },
  {
    id: '2',
    name: 'Amoxicillin',
    description: 'Antibiotic for bacterial infections',
    price: 12.99,
    category: 'Antibiotics',
    quantity: 50,
    available: true,
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=500'
  },
  {
    id: '3',
    name: 'Cetirizine',
    description: 'Antihistamine for allergies',
    price: 8.99,
    category: 'Allergies',
    quantity: 75,
    available: true,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500'
  }
];

export const PharmacyDashboard: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>(sampleMedicines);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('pharmacyLoggedIn');
    if (!isLoggedIn) {
      navigate('/pharmacy-login');
    }
  }, [navigate]);

  const handleAddMedicine = (newMedicine: Medicine) => {
    setMedicines([...medicines, newMedicine]);
  };

  const handleDeleteMedicine = (id: string) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      setMedicines(medicines.filter(medicine => medicine.id !== id));
    }
  };

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pharmacy Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your medicine inventory</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Medicines</h3>
            <p className="text-3xl font-bold text-blue-600">{medicines.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900">Low Stock Items</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {medicines.filter(m => m.quantity < 10).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900">Out of Stock</h3>
            <p className="text-3xl font-bold text-red-600">
              {medicines.filter(m => m.quantity === 0).length}
            </p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
          <div className="w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            Add New Medicine
          </button>
        </div>

        {/* Medicines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedicines.map(medicine => (
            <div
              key={medicine.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <img
                src={medicine.image}
                alt={medicine.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{medicine.name}</h3>
                  <span className="text-lg font-bold text-blue-600">₵{medicine.price.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{medicine.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-gray-500">{medicine.category}</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    medicine.quantity > 10
                      ? 'bg-green-100 text-green-800'
                      : medicine.quantity > 0
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    Stock: {medicine.quantity}
                  </span>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {/* Implement edit functionality */}}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteMedicine(medicine.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results Message */}
        {filteredMedicines.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No medicines found matching your search.</p>
          </div>
        )}

        {/* Add Medicine Modal */}
        <AddMedicineModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddMedicine}
        />
      </div>
    </div>
  );
};