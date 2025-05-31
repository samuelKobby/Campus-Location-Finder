import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FaSave, FaBell, FaShieldAlt, FaCog, FaDatabase } from 'react-icons/fa';

interface Settings {
  notification_settings: {
    email_notifications: boolean;
    low_stock_alerts: boolean;
    new_pharmacy_alerts: boolean;
  };
  security_settings: {
    two_factor_auth: boolean;
    session_timeout: number;
    password_expiry_days: number;
  };
  system_settings: {
    maintenance_mode: boolean;
    debug_mode: boolean;
    cache_duration: number;
  };
}

export const Settings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('notifications');
  const [settings, setSettings] = useState<Settings>({
    notification_settings: {
      email_notifications: true,
      low_stock_alerts: true,
      new_pharmacy_alerts: true
    },
    security_settings: {
      two_factor_auth: false,
      session_timeout: 30,
      password_expiry_days: 90
    },
    system_settings: {
      maintenance_mode: false,
      debug_mode: false,
      cache_duration: 3600
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .single();

      if (error) throw error;
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('admin_settings')
        .upsert([settings]);

      if (error) throw error;

      // Log the activity
      await supabase
        .from('activity_logs')
        .insert({
          action_type: 'update',
          entity_type: 'settings',
          details: { updated_sections: [activeTab] }
        });

    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (
    section: keyof Settings,
    key: string,
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          <FaSave className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Settings Navigation */}
      <div className="bg-white shadow-sm rounded-lg">
        <nav className="flex divide-x divide-gray-200">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'notifications'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaBell className="w-4 h-4 inline-block mr-2" />
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'security'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaShieldAlt className="w-4 h-4 inline-block mr-2" />
            Security
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'system'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaCog className="w-4 h-4 inline-block mr-2" />
            System
          </button>
        </nav>
      </div>

      {/* Settings Content */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Email Notifications
                  </label>
                  <p className="text-sm text-gray-500">
                    Receive important updates via email
                  </p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    checked={settings.notification_settings.email_notifications}
                    onChange={(e) =>
                      updateSettings(
                        'notification_settings',
                        'email_notifications',
                        e.target.checked
                      )
                    }
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Low Stock Alerts
                  </label>
                  <p className="text-sm text-gray-500">
                    Get notified when medicine stock is running low
                  </p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    checked={settings.notification_settings.low_stock_alerts}
                    onChange={(e) =>
                      updateSettings(
                        'notification_settings',
                        'low_stock_alerts',
                        e.target.checked
                      )
                    }
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    New Pharmacy Alerts
                  </label>
                  <p className="text-sm text-gray-500">
                    Get notified when new pharmacies register
                  </p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    checked={settings.notification_settings.new_pharmacy_alerts}
                    onChange={(e) =>
                      updateSettings(
                        'notification_settings',
                        'new_pharmacy_alerts',
                        e.target.checked
                      )
                    }
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Two-Factor Authentication
                  </label>
                  <p className="text-sm text-gray-500">
                    Enable 2FA for enhanced security
                  </p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    checked={settings.security_settings.two_factor_auth}
                    onChange={(e) =>
                      updateSettings(
                        'security_settings',
                        'two_factor_auth',
                        e.target.checked
                      )
                    }
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={settings.security_settings.session_timeout}
                  onChange={(e) =>
                    updateSettings(
                      'security_settings',
                      'session_timeout',
                      parseInt(e.target.value)
                    )
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="5"
                  max="120"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Password Expiry (days)
                </label>
                <input
                  type="number"
                  value={settings.security_settings.password_expiry_days}
                  onChange={(e) =>
                    updateSettings(
                      'security_settings',
                      'password_expiry_days',
                      parseInt(e.target.value)
                    )
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="30"
                  max="365"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Maintenance Mode
                  </label>
                  <p className="text-sm text-gray-500">
                    Enable maintenance mode to prevent user access
                  </p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    checked={settings.system_settings.maintenance_mode}
                    onChange={(e) =>
                      updateSettings(
                        'system_settings',
                        'maintenance_mode',
                        e.target.checked
                      )
                    }
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Debug Mode
                  </label>
                  <p className="text-sm text-gray-500">
                    Enable detailed error messages and logging
                  </p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    checked={settings.system_settings.debug_mode}
                    onChange={(e) =>
                      updateSettings(
                        'system_settings',
                        'debug_mode',
                        e.target.checked
                      )
                    }
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Cache Duration (seconds)
                </label>
                <input
                  type="number"
                  value={settings.system_settings.cache_duration}
                  onChange={(e) =>
                    updateSettings(
                      'system_settings',
                      'cache_duration',
                      parseInt(e.target.value)
                    )
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="300"
                  max="86400"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
