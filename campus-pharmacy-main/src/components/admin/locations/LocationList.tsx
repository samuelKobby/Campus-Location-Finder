import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

interface Location {
  id: string;
  name: string;
  address: string;
  description?: string;
  contact_number?: string;
  email?: string;
}

interface LocationListProps {
  locations: Location[];
  onEdit: (location: Location) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export const LocationList: React.FC<LocationListProps> = ({
  locations,
  onEdit,
  onDelete,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No locations found</p>
      </div>
    );
  }

  return (
    <div className="bg-white/20 backdrop-blur-md rounded-lg shadow-sm p-6 border border-white/30">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Address
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200">
          {locations.map((location) => (
            <tr key={location.id} className="hover:bg-white/30 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{location.name}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-500">{location.address}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-500">
                  {location.contact_number && (
                    <div>{location.contact_number}</div>
                  )}
                  {location.email && (
                    <div className="text-blue-600">{location.email}</div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(location)}
                  className="text-blue-600 hover:text-blue-800 mr-4 transition-colors"
                >
                  <FaEdit className="inline-block" />
                </button>
                <button
                  onClick={() => onDelete(location.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <FaTrash className="inline-block" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
