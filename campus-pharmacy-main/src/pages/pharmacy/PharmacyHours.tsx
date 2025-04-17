import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Clock, Save, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

interface WeekHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export const PharmacyHours: React.FC = () => {
  const [hours, setHours] = useState<WeekHours>({
    monday: { open: '09:00', close: '17:00', closed: false },
    tuesday: { open: '09:00', close: '17:00', closed: false },
    wednesday: { open: '09:00', close: '17:00', closed: false },
    thursday: { open: '09:00', close: '17:00', closed: false },
    friday: { open: '09:00', close: '17:00', closed: false },
    saturday: { open: '09:00', close: '13:00', closed: false },
    sunday: { open: '09:00', close: '13:00', closed: true },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchHours();
  }, []);

  const fetchHours = async () => {
    try {
      const pharmacyId = localStorage.getItem('pharmacyId');
      const { data, error } = await supabase
        .from('pharmacies')
        .select('hours')
        .eq('id', pharmacyId)
        .single();

      if (error) throw error;
      if (data?.hours) {
        setHours(data.hours);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const pharmacyId = localStorage.getItem('pharmacyId');
      const { error } = await supabase
        .from('pharmacies')
        .update({ hours })
        .eq('id', pharmacyId);

      if (error) throw error;
      toast.success('Operating hours updated successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTimeChange = (day: keyof WeekHours, type: 'open' | 'close', value: string) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value,
      },
    }));
  };

  const handleClosedToggle = (day: keyof WeekHours) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        closed: !prev[day].closed,
      },
    }));
  };

  const formatDay = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Operating Hours</h1>
          <p className="mt-1 text-sm text-gray-500">
            Set your pharmacy's operating hours for each day of the week
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={fetchHours}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Save className="h-5 w-5 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Hours Form */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            {Object.entries(hours).map(([day, dayHours]) => (
              <div key={day} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors duration-150">
                <div className="flex items-center mb-4 sm:mb-0">
                  <Clock className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900 w-24">
                    {formatDay(day)}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={!dayHours.closed}
                      onChange={() => handleClosedToggle(day as keyof WeekHours)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-500">
                      {dayHours.closed ? 'Closed' : 'Open'}
                    </span>
                  </label>
                </div>
                {!dayHours.closed && (
                  <div className="flex items-center space-x-4">
                    <div>
                      <label htmlFor={`${day}-open`} className="block text-sm font-medium text-gray-700">
                        Opens at
                      </label>
                      <input
                        type="time"
                        id={`${day}-open`}
                        value={dayHours.open}
                        onChange={(e) => handleTimeChange(day as keyof WeekHours, 'open', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor={`${day}-close`} className="block text-sm font-medium text-gray-700">
                        Closes at
                      </label>
                      <input
                        type="time"
                        id={`${day}-close`}
                        value={dayHours.close}
                        onChange={(e) => handleTimeChange(day as keyof WeekHours, 'close', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Important Note
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Make sure to set accurate operating hours. These hours will be displayed to customers
                and will affect their ability to place orders. Don't forget to save your changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
