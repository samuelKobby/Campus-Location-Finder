import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

interface ActivityLog {
  id: string;
  admin_id: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  details: any;
  created_at: string;
  admin: {
    full_name: string;
  };
}

export const ActivityLog: React.FC = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          admin:admin_users(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'create':
        return '➕';
      case 'update':
        return '✏️';
      case 'delete':
        return '🗑️';
      case 'approve':
        return '✅';
      case 'reject':
        return '❌';
      default:
        return '📝';
    }
  };

  const formatActivityMessage = (activity: ActivityLog) => {
    const adminName = activity.admin?.full_name || 'Unknown Admin';
    const action = activity.action_type.toLowerCase();
    const entity = activity.entity_type.toLowerCase().replace('_', ' ');
    
    return `${adminName} ${action} a ${entity}`;
  };

  if (loading) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-6">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                {getActionIcon(activity.action_type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {formatActivityMessage(activity)}
                </p>
                <p className="text-sm text-gray-500">
                  {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                </p>
                {activity.details && (
                  <div className="mt-1 text-sm text-gray-600">
                    <pre className="whitespace-pre-wrap font-sans">
                      {JSON.stringify(activity.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {activities.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          No recent activity to display
        </div>
      )}
    </div>
  );
};
