import React, { useEffect, useState } from 'react';
import { usePharmacyAuth } from '../../contexts/PharmacyAuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  AlertCircle,
  Package,
  Filter,
  RefreshCw,
  X,
  ChevronDown,
  Package2,
  FolderOpen,
  DollarSign,
  Hash,
  Box,
  Image as ImageIcon,
  Trash2 as TrashIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import placeholderImage from '../../assets/placeholder.svg';

interface Medicine {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  description: string;
  unit: string;
  image?: string | File;
  imageUrl?: string;
}

interface NewMedicineFormProps {
  onSubmit: (medicine: Omit<Medicine, 'id'>) => void;
  onClose: () => void;
}

const NewMedicineForm: React.FC<NewMedicineFormProps> = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: 0,
    quantity: 0,
    unit: 'tablets',
    description: '',
    image: null as File | null
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'price') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (name === 'quantity') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      category: formData.category,
      price: formData.price,
      quantity: formData.quantity,
      unit: formData.unit,
      description: formData.description || '',
      image: formData.image || undefined
    });
  };

  const clearImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl transform transition-all my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Add New Medicine</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Medicine Name
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Package2 className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200 placeholder-gray-400 sm:text-sm bg-white hover:border-gray-400"
                placeholder="Enter medicine name"
              />
            </div>
          </div>

          {/* Category Input */}
          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FolderOpen className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200 placeholder-gray-400 sm:text-sm bg-white hover:border-gray-400"
                placeholder="Enter category"
              />
            </div>
          </div>

          {/* Price and Quantity Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Price Input */}
            <div className="space-y-2">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200 placeholder-gray-400 sm:text-sm bg-white hover:border-gray-400"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            {/* Quantity Input */}
            <div className="space-y-2">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Quantity
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  required
                  value={formData.quantity}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200 placeholder-gray-400 sm:text-sm bg-white hover:border-gray-400"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Unit Input */}
          <div className="space-y-2">
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
              Unit
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Box className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="unit"
                value={formData.unit}
                onChange={handleChange}
                className="block w-full pl-10 pr-10 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200 placeholder-gray-400 sm:text-sm bg-white hover:border-gray-400 appearance-none cursor-pointer"
              >
                <option value="tablets">Tablets</option>
                <option value="capsules">Capsules</option>
                <option value="ml">Milliliters (ml)</option>
                <option value="mg">Milligrams (mg)</option>
                <option value="pieces">Pieces</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AlertCircle className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                id="description"
                value={formData.description}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200 placeholder-gray-400 sm:text-sm bg-white hover:border-gray-400"
                placeholder="Enter description"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
              Medicine Image
            </label>
            <div className="mt-1 flex flex-col items-center space-y-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-48 w-48 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 cursor-pointer transition-colors"
                >
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">Click to upload image</span>
                </div>
              )}
              <input
                type="file"
                id="image"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Add Medicine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditMedicineModal: React.FC<{
  medicine: Medicine | null;
  onClose: () => void;
  onSave: (medicine: Medicine) => void;
}> = ({ medicine, onClose, onSave }) => {
  const [editedMedicine, setEditedMedicine] = useState<Medicine | null>(medicine);

  React.useEffect(() => {
    setEditedMedicine(medicine);
  }, [medicine]);

  if (!editedMedicine) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedMedicine) {
      onSave(editedMedicine);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl transform transition-all my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Edit Medicine</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Medicine Name
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Package2 className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                value={editedMedicine.name}
                onChange={(e) => setEditedMedicine({ ...editedMedicine, name: e.target.value })}
                className="block w-full pl-10 pr-3 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200 placeholder-gray-400 sm:text-sm bg-white hover:border-gray-400"
                placeholder="Enter medicine name"
              />
            </div>
          </div>

          {/* Category Input */}
          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FolderOpen className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="category"
                value={editedMedicine.category}
                onChange={(e) => setEditedMedicine({ ...editedMedicine, category: e.target.value })}
                className="block w-full pl-10 pr-3 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200 placeholder-gray-400 sm:text-sm bg-white hover:border-gray-400"
                placeholder="Enter category"
              />
            </div>
          </div>

          {/* Price and Quantity Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Price Input */}
            <div className="space-y-2">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="price"
                  value={editedMedicine.price}
                  onChange={(e) => setEditedMedicine({ ...editedMedicine, price: parseFloat(e.target.value) })}
                  className="block w-full pl-10 pr-3 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200 placeholder-gray-400 sm:text-sm bg-white hover:border-gray-400"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            {/* Quantity Input */}
            <div className="space-y-2">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Quantity
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="quantity"
                  value={editedMedicine.quantity}
                  onChange={(e) => setEditedMedicine({ ...editedMedicine, quantity: parseInt(e.target.value) })}
                  className="block w-full pl-10 pr-3 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200 placeholder-gray-400 sm:text-sm bg-white hover:border-gray-400"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Unit Input */}
          <div className="space-y-2">
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
              Unit
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Box className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="unit"
                value={editedMedicine.unit}
                onChange={(e) => setEditedMedicine({ ...editedMedicine, unit: e.target.value })}
                className="block w-full pl-10 pr-10 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200 placeholder-gray-400 sm:text-sm bg-white hover:border-gray-400 appearance-none cursor-pointer"
              >
                <option value="tablets">Tablets</option>
                <option value="capsules">Capsules</option>
                <option value="ml">Milliliters (ml)</option>
                <option value="mg">Milligrams (mg)</option>
                <option value="pieces">Pieces</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const getMedicineImageUrl = (medicineId: string) => {
  const { data: imageUrl } = supabase.storage
    .from('medicine-images')
    .getPublicUrl(`${medicineId}.jpg`);
  return imageUrl.publicUrl;
};

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.src = placeholderImage;
};

export const PharmacyInventory: React.FC = () => {
  const { pharmacyId } = usePharmacyAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [existingMedicines, setExistingMedicines] = useState<Medicine[]>([]);
  const [isAddingExisting, setIsAddingExisting] = useState(false);
  const navigate = useNavigate();

  // Filter medicines based on search term and category
  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || medicine.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  React.useEffect(() => {
    fetchMedicines();
    fetchAllMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      if (!pharmacyId) return;

      // First get the medicine_pharmacies entries
      const { data: medicinePharmacies, error: mpError } = await supabase
        .from('medicine_pharmacies')
        .select('medicine_id, quantity')
        .eq('pharmacy_id', pharmacyId);

      if (mpError) throw mpError;

      // Then get all medicines
      const { data: medicinesData, error: medError } = await supabase
        .from('medicines')
        .select('*');

      if (medError) throw medError;

      // Map the quantities to the medicines
      const formattedData = medicinesData
        .map(medicine => {
          const pharmacyEntry = medicinePharmacies?.find(mp => mp.medicine_id === medicine.id);
          return {
            id: medicine.id,
            name: medicine.name,
            category: medicine.category,
            price: medicine.price,
            description: medicine.description,
            unit: medicine.unit,
            imageUrl: medicine.image_url,
            quantity: pharmacyEntry?.quantity || 0
          };
        })
        .filter(medicine => medicine.quantity > 0); // Only show medicines with stock

      setMedicines(formattedData);
    } catch (error: any) {
      console.error('Error fetching medicines:', error);
      toast.error('Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all available medicines
  const fetchAllMedicines = async () => {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      // Add image URLs to all medicines
      const medicinesWithImages = data?.map(medicine => ({
        ...medicine,
        imageUrl: getMedicineImageUrl(medicine.id)
      })) || [];

      setExistingMedicines(medicinesWithImages);
      setMedicines(medicinesWithImages);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(medicinesWithImages.map(m => m.category))];
      setCategories(uniqueCategories);
    } catch (error: any) {
      console.error('Error fetching all medicines:', error);
      toast.error('Failed to fetch available medicines');
    }
  };

  const handleAddMedicine = async (medicine: Omit<Medicine, 'id'>) => {
    try {
      if (!pharmacyId) {
        toast.error('No pharmacy ID found');
        return;
      }

      // First, add the medicine to the medicines table
      const { data: medicineData, error: medicineError } = await supabase
        .from('medicines')
        .insert([{
          name: medicine.name,
          category: medicine.category,
          price: medicine.price,
          unit: medicine.unit || 'tablets',
          description: medicine.description || ''
        }])
        .select()
        .single();

      if (medicineError) throw medicineError;

      // Then create the association in medicine_pharmacies
      const { error: associationError } = await supabase
        .from('medicine_pharmacies')
        .insert([{
          medicine_id: medicineData.id,
          pharmacy_id: pharmacyId,
          quantity: medicine.quantity
        }]);

      if (associationError) throw associationError;

      // Handle image upload if present
      if (medicine.image) {
        const { error: imageError } = await supabase.storage
          .from('medicine-images')
          .upload(`${medicineData.id}.jpg`, medicine.image, {
            upsert: true
          });

        if (imageError) throw imageError;
      }

      toast.success('Medicine added successfully');
      fetchMedicines();
      setShowAddModal(false);
    } catch (error: any) {
      console.error('Error adding medicine:', error);
      toast.error(error.message);
    }
  };

  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [quantity, setQuantity] = useState('');
  const [showAddExistingForm, setShowAddExistingForm] = useState(false);

  const handleMedicineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const medicine = existingMedicines.find(m => m.id === e.target.value);
    setSelectedMedicine(medicine || null);
  };

  const handleAddExistingMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!selectedMedicine || !quantity) {
        toast.error('Please select a medicine and enter quantity');
        return;
      }

      // Check if medicine already exists in pharmacy's inventory
      const { data: existingData, error: existingError } = await supabase
        .from('medicine_pharmacies')
        .select('*')
        .eq('pharmacy_id', pharmacyId)
        .eq('medicine_id', selectedMedicine.id)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }

      if (existingData) {
        // Update existing quantity
        const { error: updateError } = await supabase
          .from('medicine_pharmacies')
          .update({ quantity: existingData.quantity + Number(quantity) })
          .eq('pharmacy_id', pharmacyId)
          .eq('medicine_id', selectedMedicine.id);

        if (updateError) throw updateError;
        toast.success('Medicine quantity updated successfully!');
      } else {
        // Add new medicine-pharmacy relationship
        const { error: insertError } = await supabase
          .from('medicine_pharmacies')
          .insert({
            pharmacy_id: pharmacyId,
            medicine_id: selectedMedicine.id,
            quantity: Number(quantity)
          });

        if (insertError) throw insertError;
        toast.success('Medicine added to inventory successfully!');
      }

      // Reset form
      setSelectedMedicine(null);
      setQuantity('');
      setShowAddExistingForm(false); // Hide the form after successful addition
      fetchMedicines(); // Refresh the inventory list
    } catch (error: any) {
      console.error('Error adding medicine:', error);
      toast.error(error.message || 'Failed to add medicine');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMedicine = async (medicine: Medicine) => {
    try {
      // Update medicine details
      const { error: medicineError } = await supabase
        .from('medicines')
        .update({
          name: medicine.name,
          category: medicine.category,
          price: medicine.price,
          unit: medicine.unit,
          description: medicine.description || ''
        })
        .eq('id', medicine.id);

      if (medicineError) {
        console.error('Error updating medicine:', medicineError);
        throw medicineError;
      }

      // Update quantity in medicine_pharmacies
      const { error: quantityError } = await supabase
        .from('medicine_pharmacies')
        .update({ quantity: medicine.quantity })
        .eq('medicine_id', medicine.id)
        .eq('pharmacy_id', pharmacyId);

      if (quantityError) {
        console.error('Error updating quantity:', quantityError);
        throw quantityError;
      }

      toast.success('Medicine updated successfully');
      fetchMedicines();
      setEditingMedicine(null);
    } catch (error: any) {
      console.error('Error updating medicine:', error);
      toast.error(error.message);
    }
  };

  const handleDeleteMedicine = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;

    try {
      console.log('Deleting medicine:', id);

      // Remove the association from medicine_pharmacies
      const { error: associationError } = await supabase
        .from('medicine_pharmacies')
        .delete()
        .eq('medicine_id', id)
        .eq('pharmacy_id', pharmacyId);

      console.log('Association delete response:', { error: associationError });

      if (associationError) {
        console.error('Error deleting association:', associationError);
        throw associationError;
      }

      toast.success('Medicine removed from inventory');
      fetchMedicines();
    } catch (error: any) {
      console.error('Error deleting medicine:', error);
      toast.error(error.message);
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (quantity <= 10) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your pharmacy's medicine inventory
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsAddingExisting(false);
              setShowAddModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Medicine
          </button>
          <button
            onClick={() => {
              setIsAddingExisting(true);
              setShowAddExistingForm(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Existing Medicine
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Search Input */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Medicines
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition duration-150 ease-in-out"
              placeholder="Type to search..."
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600"
              >
                <X className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Category
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm appearance-none cursor-pointer transition duration-150 ease-in-out"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
              <option value="tablets">Tablets</option>
              <option value="syrups">Syrups</option>
              <option value="topical">Topical</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Medicine
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Category
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Quantity
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Price
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filteredMedicines.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No medicines found
                </td>
              </tr>
            ) : (
              filteredMedicines.map((medicine) => {
                const status = getStockStatus(medicine.quantity);
                return (
                  <tr key={medicine.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                      <div className="flex items-center">
                        <div className="h-16 w-16 flex-shrink-0">
                          <img
                            className="h-16 w-16 rounded-lg object-cover shadow-sm"
                            src={medicine.imageUrl || placeholderImage}
                            alt={medicine.name}
                            onError={handleImageError}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{medicine.name}</div>
                          <div className="text-gray-500 text-sm truncate max-w-xs">
                            {medicine.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {medicine.category}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">{medicine.quantity}</span>
                        <span className="text-gray-400">{medicine.unit}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="font-medium">₵{medicine.price.toFixed(2)}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setEditingMedicine(medicine)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMedicine(medicine.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">
              {isAddingExisting ? 'Add Existing Medicine' : 'Add New Medicine'}
            </h2>
            
            {isAddingExisting ? (
              <form onSubmit={handleAddExistingMedicine}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="medicineId" className="block text-sm font-medium text-gray-700">
                      Medicine
                    </label>
                    <select
                      id="medicineId"
                      name="medicineId"
                      required
                      value={selectedMedicine?.id || ''}
                      onChange={handleMedicineChange}
                      className="block w-full pl-10 pr-10 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200 sm:text-sm"
                    >
                      <option value="">Select a medicine</option>
                      {existingMedicines.map((medicine) => (
                        <option key={medicine.id} value={medicine.id}>
                          {medicine.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                      Quantity
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      min="0"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add to Inventory
                  </button>
                </div>
              </form>
            ) : (
              <NewMedicineForm
                onSubmit={handleAddMedicine}
                onClose={() => setShowAddModal(false)}
              />
            )}
          </div>
        </div>
      )}
      {showAddExistingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">
              Add Existing Medicine
            </h2>
            
            <form onSubmit={handleAddExistingMedicine}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="medicineId" className="block text-sm font-medium text-gray-700">
                    Medicine
                  </label>
                  <select
                    id="medicineId"
                    name="medicineId"
                    required
                    value={selectedMedicine?.id || ''}
                    onChange={handleMedicineChange}
                    className="block w-full pl-10 pr-10 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200 sm:text-sm"
                  >
                    <option value="">Select a medicine</option>
                    {existingMedicines.map((medicine) => (
                      <option key={medicine.id} value={medicine.id}>
                        {medicine.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="0"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddExistingForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {editingMedicine && (
        <EditMedicineModal
          medicine={editingMedicine}
          onClose={() => setEditingMedicine(null)}
          onSave={handleUpdateMedicine}
        />
      )}
    </div>
  );
};
