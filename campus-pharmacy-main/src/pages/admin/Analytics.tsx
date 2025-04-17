import React, { useState, useEffect } from 'react';
import { FaChartBar, FaUsers, FaPills, FaClinicMedical } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import { format, subDays } from 'date-fns';

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
  trend: 'up' | 'down';
  loading?: boolean;
}

interface Stats {
  totalUsers: number;
  activePharmacies: number;
  totalMedicines: number;
  dailySearches: number;
  usersTrend: 'up' | 'down';
  pharmaciesTrend: 'up' | 'down';
  medicinesTrend: 'up' | 'down';
  searchesTrend: 'up' | 'down';
  usersChange: string;
  pharmaciesChange: string;
  medicinesChange: string;
  searchesChange: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, trend, loading }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold mt-2">
          {loading ? (
            <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
          ) : (
            value
          )}
        </h3>
      </div>
      <div className="bg-blue-50 p-3 rounded-full">{icon}</div>
    </div>
    <div className="mt-4">
      {loading ? (
        <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
      ) : (
        <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
      )}
    </div>
  </div>
);

export const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activePharmacies: 0,
    totalMedicines: 0,
    dailySearches: 0,
    usersTrend: 'up',
    pharmaciesTrend: 'up',
    medicinesTrend: 'up',
    searchesTrend: 'up',
    usersChange: '',
    pharmaciesChange: '',
    medicinesChange: '',
    searchesChange: '',
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Get total users (pharmacy accounts)
      const { count: totalUsers } = await supabase
        .from('pharmacies')
        .select('*', { count: 'exact' });

      // Get active pharmacies (approved and available)
      const { count: activePharmacies } = await supabase
        .from('pharmacies')
        .select('*', { count: 'exact' })
        .eq('available', true);

      // Get total medicines
      const { count: totalMedicines } = await supabase
        .from('medicines')
        .select('*', { count: 'exact' });

      // Get daily searches from activity logs
      const today = new Date();
      const yesterday = subDays(today, 1);
      const { count: dailySearches } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact' })
        .eq('action_type', 'search')
        .gte('created_at', format(yesterday, 'yyyy-MM-dd'));

      // Calculate trends (comparing with last week)
      const lastWeek = subDays(today, 7);
      const { count: lastWeekUsers } = await supabase
        .from('pharmacies')
        .select('*', { count: 'exact' })
        .lte('created_at', format(lastWeek, 'yyyy-MM-dd'));

      const userChange = lastWeekUsers ? ((totalUsers! - lastWeekUsers) / lastWeekUsers) * 100 : 0;

      setStats({
        totalUsers: totalUsers || 0,
        activePharmacies: activePharmacies || 0,
        totalMedicines: totalMedicines || 0,
        dailySearches: dailySearches || 0,
        usersTrend: userChange >= 0 ? 'up' : 'down',
        pharmaciesTrend: 'up',
        medicinesTrend: 'up',
        searchesTrend: 'up',
        usersChange: `${Math.abs(userChange).toFixed(1)}% from last week`,
        pharmaciesChange: 'Updated today',
        medicinesChange: 'Updated today',
        searchesChange: 'In the last 24h',
      });

      // Fetch recent activity
      const { data: activities } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentActivity(activities || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Analytics Overview</h2>
        <p className="text-gray-600 mt-1">Monitor key metrics and performance indicators</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          change={stats.usersChange}
          icon={<FaUsers className="h-6 w-6 text-blue-500" />}
          trend={stats.usersTrend}
          loading={loading}
        />
        <StatCard
          title="Active Pharmacies"
          value={stats.activePharmacies}
          change={stats.pharmaciesChange}
          icon={<FaClinicMedical className="h-6 w-6 text-blue-500" />}
          trend={stats.pharmaciesTrend}
          loading={loading}
        />
        <StatCard
          title="Total Medicines"
          value={stats.totalMedicines}
          change={stats.medicinesChange}
          icon={<FaPills className="h-6 w-6 text-blue-500" />}
          trend={stats.medicinesTrend}
          loading={loading}
        />
        <StatCard
          title="Daily Searches"
          value={stats.dailySearches}
          change={stats.searchesChange}
          icon={<FaChartBar className="h-6 w-6 text-blue-500" />}
          trend={stats.searchesTrend}
          loading={loading}
        />
      </div>

      {/* Recent Activity Section */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))
          ) : recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div key={activity.id} className="border-b border-gray-100 pb-3">
                <p className="text-sm text-gray-800">
                  {activity.action_type.charAt(0).toUpperCase() + activity.action_type.slice(1)} - {activity.entity_type}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
};