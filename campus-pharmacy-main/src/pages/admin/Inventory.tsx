import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { createNotification } from '../../utils/notifications';

interface Medicine {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

interface MedicineFormData {
  name: string;
  category: string;
  price: string;
  stock: string;
}

export const Inventory: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [formData, setFormData] = useState<MedicineFormData>({
    name: '',
    category: '',
    price: '',
    stock: ''
  });

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .order('name');

      if (error) throw error;

      const medicinesWithStatus = (data || []).map(med => ({
        ...med,
        status: getStockStatus(med.stock)
      }));

      setMedicines(medicinesWithStatus);
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const getStockStatus = (stock: number): Medicine['status'] => {
    if (stock <= 0) return 'Out of Stock';
    if (stock <= 10) return 'Low Stock';
    return 'In Stock';
  };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const newMedicine = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      };

      const { error, data } = await supabase
        .from('medicines')
        .insert([newMedicine])
        .select();

      if (error) throw error;

      // Create notification for new medicine added
      await createNotification({
        title: 'New Medicine Added',
        message: `${formData.name} has been added to the inventory with ${formData.stock} units in stock.`,
        type: 'success'
      });

      // Check if stock is low and create a warning notification
      if (parseInt(formData.stock) <= 10) {
        await createNotification({
          title: 'Low Stock Warning',
          message: `${formData.name} has been added with low stock (${formData.stock} units).`,
          type: 'warning'
        });
      }

      toast.success('Medicine added successfully!');
      setShowAddModal(false);
      setFormData({ name: '', category: '', price: '', stock: '' });
      await fetchMedicines();
    } catch (error: any) {
      setError(error.message);
      console.error('Error adding medicine:', error);
      toast.error('Failed to add medicine');

      // Create error notification
      await createNotification({
        title: 'Error Adding Medicine',
        message: `Failed to add ${formData.name}: ${error.message}`,
        type: 'error'
      });
    }
  };

  const handleUpdateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedicine) return;

    try {
      setError(null);
      const updatedMedicine = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      };

      // Get previous stock value to check for stock changes
      const previousStock = editingMedicine.stock;
      const newStock = parseInt(formData.stock);

      const { error } = await supabase
        .from('medicines')
        .update(updatedMedicine)
        .eq('id', editingMedicine.id);

      if (error) throw error;

      // Create notification for medicine update
      await createNotification({
        title: 'Medicine Updated',
        message: `${formData.name} has been updated in the inventory.`,
        type: 'info'
      });

      // Check for stock level changes
      if (previousStock > 10 && newStock <= 10 && newStock > 0) {
        // Stock has dropped to low levels
        await createNotification({
          title: 'Low Stock Alert',
          message: `${formData.name} stock is now low (${newStock} units).`,
          type: 'warning'
        });
      } else if (previousStock > 0 && newStock <= 0) {
        // Stock has dropped to zero or below
        await createNotification({
          title: 'Out of Stock Alert',
          message: `${formData.name} is now out of stock.`,
          type: 'error'
        });
      } else if (previousStock <= 0 && newStock > 0) {
        // Stock has been replenished from zero
        await createNotification({
          title: 'Stock Replenished',
          message: `${formData.name} is back in stock (${newStock} units).`,
          type: 'success'
        });
      } else if (previousStock <= 10 && newStock > 10) {
        // Stock has been replenished from low levels
        await createNotification({
          title: 'Stock Replenished',
          message: `${formData.name} stock has been replenished to ${newStock} units.`,
          type: 'success'
        });
      }

      toast.success('Medicine updated successfully!');
      setShowAddModal(false);
      setEditingMedicine(null);
      setFormData({ name: '', category: '', price: '', stock: '' });
      await fetchMedicines();
    } catch (error: any) {
      setError(error.message);
      console.error('Error updating medicine:', error);
      toast.error('Failed to update medicine');

      // Create error notification
      await createNotification({
        title: 'Error Updating Medicine',
        message: `Failed to update ${formData.name}: ${error.message}`,
        type: 'error'
      });
    }
  };

  const handleDeleteMedicine = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;

    try {
      setError(null);
      
      // Get medicine details before deletion
      const { data: medicineData, error: fetchError } = await supabase
        .from('medicines')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      
      const { error } = await supabase
        .from('medicines')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Create notification for medicine deletion
      await createNotification({
        title: 'Medicine Deleted',
        message: `${medicineData.name} has been removed from the inventory.`,
        type: 'warning'
      });

      toast.success('Medicine deleted successfully!');
      await fetchMedicines();
    } catch (error: any) {
      setError(error.message);
      console.error('Error deleting medicine:', error);
      toast.error('Failed to delete medicine');

      // Create error notification
      await createNotification({
        title: 'Error Deleting Medicine',
        message: `Failed to delete medicine: ${error.message}`,
        type: 'error'
      });
    }
  };

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || medicine.category === categoryFilter;
    const matchesStatus = !statusFilter || medicine.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = Array.from(new Set(medicines.map(m => m.category)));

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaSearch className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Medicine Inventory</h2>
          <p className="text-gray-600 mt-1">Manage medicine stock and details</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-600"
        >
          <FaPlus />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-40 pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-40 pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
            >
              <option value="">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading medicines...</p>
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No medicines found</p>
          </div>
        ) : (
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-x-auto border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medicine
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMedicines.map((medicine) => (
                    <tr key={medicine.id}>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{medicine.name}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{medicine.category}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">GH₵{medicine.price.toFixed(2)}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{medicine.stock}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          medicine.status === 'In Stock'
                            ? 'bg-green-100 text-green-800'
                            : medicine.status === 'Low Stock'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {medicine.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setEditingMedicine(medicine);
                            setFormData({
                              name: medicine.name,
                              category: medicine.category,
                              price: medicine.price.toString(),
                              stock: medicine.stock.toString()
                            });
                          }}
                          className="text-blue-600 hover:text-blue-900 mx-2"
                        >
                          <FaEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMedicine(medicine.id)}
                          className="text-red-600 hover:text-red-900 mx-2"
                        >
                          <FaTrash className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Medicine Modal */}
      {(showAddModal || editingMedicine) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
              </h3>
              <form onSubmit={editingMedicine ? handleUpdateMedicine : handleAddMedicine} className="mt-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stock</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-5 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingMedicine(null);
                      setFormData({ name: '', category: '', price: '', stock: '' });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md"
                  >
                    {editingMedicine ? 'Update' : 'Add'}
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
