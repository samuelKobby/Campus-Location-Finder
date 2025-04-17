import React from 'react';

interface Pharmacy {
  name: string;
  phone: string;
  location: string;
}

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  pharmacy: Pharmacy;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, pharmacy }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">{pharmacy.name}</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Phone</h3>
            <a
              href={`tel:${pharmacy.phone}`}
              className="text-blue-500 hover:text-blue-600"
            >
              {pharmacy.phone}
            </a>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Location</h3>
            <p>{pharmacy.location}</p>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Close
            </button>
            <a
              href={`tel:${pharmacy.phone}`}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Call Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};