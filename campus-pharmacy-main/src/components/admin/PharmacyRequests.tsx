import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface PharmacyRequest {
  id: string;
  pharmacy_name: string;
  owner_name: string;
  email: string;
  phone: string;
  location: string;
  license_number: string;
  status: 'pending' | 'approved' | 'rejected';
  documents: any;
  admin_notes: string;
  created_at: string;
}

export const PharmacyRequests: React.FC = () => {
  const [requests, setRequests] = useState<PharmacyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PharmacyRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pharmacy_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching pharmacy requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('pharmacy_requests')
        .update({
          status: newStatus,
          admin_notes: adminNotes
        })
        .eq('id', requestId);

      if (error) throw error;

      // If approved, create a new pharmacy
      if (newStatus === 'approved' && selectedRequest) {
        const { error: pharmacyError } = await supabase
          .from('pharmacies')
          .insert({
            name: selectedRequest.pharmacy_name,
            location: selectedRequest.location,
            phone: selectedRequest.phone,
            hours: '9:00 AM - 6:00 PM', // Default hours
            available: true
          });

        if (pharmacyError) throw pharmacyError;
      }

      // Log the activity
      await supabase
        .from('activity_logs')
        .insert({
          action_type: newStatus,
          entity_type: 'pharmacy_request',
          entity_id: requestId,
          details: { notes: adminNotes }
        });

      // Refresh the requests list
      fetchRequests();
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  const RequestModal: React.FC<{ request: PharmacyRequest }> = ({ request }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white/20 backdrop-blur-md rounded-lg shadow-sm p-6 border border-white/30">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Review Pharmacy Request</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Pharmacy Name</label>
            <p className="mt-1 text-sm text-gray-900">{request.pharmacy_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Owner Name</label>
            <p className="mt-1 text-sm text-gray-900">{request.owner_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Information</label>
            <p className="mt-1 text-sm text-gray-900">{request.email}</p>
            <p className="mt-1 text-sm text-gray-900">{request.phone}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <p className="mt-1 text-sm text-gray-900">{request.location}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">License Number</label>
            <p className="mt-1 text-sm text-gray-900">{request.license_number}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes about this request..."
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => setSelectedRequest(null)}
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => handleStatusUpdate(request.id, 'rejected')}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Reject
          </button>
          <button
            onClick={() => handleStatusUpdate(request.id, 'approved')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white/20 backdrop-blur-md rounded-lg shadow-sm p-6 border border-white/30">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3 mt-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div
          key={request.id}
          className="bg-white/20 backdrop-blur-md rounded-lg shadow-sm p-6 border border-white/30"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {request.pharmacy_name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Submitted by {request.owner_name}
                </p>
              </div>
              <div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${
                      request.status === 'pending'
                        ? 'bg-yellow-100/70 text-yellow-800'
                        : request.status === 'approved'
                        ? 'bg-green-100/70 text-green-800'
                        : 'bg-red-100/70 text-red-800'
                    }`}
                >
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1 text-sm text-gray-900">{request.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="mt-1 text-sm text-gray-900">{request.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p className="mt-1 text-sm text-gray-900">{request.location}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">License Number</p>
                <p className="mt-1 text-sm text-gray-900">{request.license_number}</p>
              </div>
            </div>
            {request.status === 'pending' && (
              <div className="mt-6">
                <button
                  onClick={() => {
                    setSelectedRequest(request);
                    setAdminNotes('');
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Review Request
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {requests.length === 0 && (
        <div className="text-center py-6 bg-white/20 backdrop-blur-md rounded-lg shadow-sm p-6 border border-white/30">
          <p className="text-gray-500">No pharmacy requests to display</p>
        </div>
      )}

      {selectedRequest && <RequestModal request={selectedRequest} />}
    </div>
  );
};
