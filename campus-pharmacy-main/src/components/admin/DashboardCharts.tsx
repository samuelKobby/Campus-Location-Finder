import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { supabase } from '../../lib/supabase';

const COLORS = ['#4CAF50', '#9C27B0', '#FF9800', '#2196F3', '#E91E63'];

interface ChartData {
  locationTypes: any[];
  accessibilityStats: any[];
  weeklyVisits: any[];
}

export const DashboardCharts: React.FC = () => {
  const [data, setData] = useState<ChartData>({
    locationTypes: [],
    accessibilityStats: [],
    weeklyVisits: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      // Fetch location types distribution
      const { data: locationsData } = await supabase
        .from('locations')
        .select('building_type')
        .not('building_type', 'is', null);

      const typeCount = locationsData?.reduce((acc: any, curr: any) => {
        acc[curr.building_type] = (acc[curr.building_type] || 0) + 1;
        return acc;
      }, {});

      const locationTypes = Object.entries(typeCount || {}).map(([name, value]) => ({
        name: name.replace('_', ' ').toUpperCase(),
        value,
        percentage: ((value as number) / (locationsData?.length || 1) * 100).toFixed(1)
      }));

      // Simulate weekly visits data (you should implement actual tracking)
      const weeklyVisits = [
        { date: 'Mon', visits: 150 },
        { date: 'Tue', visits: 230 },
        { date: 'Wed', visits: 180 },
        { date: 'Thu', visits: 290 },
        { date: 'Fri', visits: 200 },
        { date: 'Sat', visits: 140 },
        { date: 'Sun', visits: 120 }
      ];

      setData({
        locationTypes: locationTypes || [],
        accessibilityStats: [],
        weeklyVisits
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading charts...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Location Types Distribution */}
      <div
        className="bg-white/20 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/30"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Open Alerts by Classification</h3>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.locationTypes}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {data.locationTypes.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                itemStyle={{ color: '#374151' }}
              />
              <Legend 
                formatter={(value) => <span style={{ color: '#374151' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Visits Trend */}
      <div
        className="bg-white/20 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/30"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Weekly Location Visits</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data.weeklyVisits}>
            <defs>
              <linearGradient id="visitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              stroke="#6B7280"
            />
            <YAxis 
              stroke="#6B7280"
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              itemStyle={{ color: '#374151' }}
            />
            <Area
              type="monotone"
              dataKey="visits"
              stroke="#4CAF50"
              fillOpacity={1}
              fill="url(#visitGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
