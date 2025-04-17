import React from 'react';
import {
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#4CAF50', '#9C27B0', '#FF9800', '#2196F3', '#E91E63'];

interface PharmacyChartsProps {
  popularMedicines: Array<{
    name: string;
    quantity: number;
  }>;
  categoryDistribution: Array<[string, number]>;
}

export const PharmacyCharts: React.FC<PharmacyChartsProps> = ({
  popularMedicines,
  categoryDistribution
}) => {
  // Transform category distribution data for the pie chart
  const categoryData = categoryDistribution.map(([name, value]) => ({
    name,
    value,
    percentage: ((value / categoryDistribution.reduce((sum, [, val]) => sum + val, 0)) * 100).toFixed(1)
  }));

  // Transform popular medicines data for the area chart
  const popularData = popularMedicines.map(item => ({
    name: item.name,
    quantity: item.quantity
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Category Distribution */}
      <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/30 hover:bg-white/30 transition-colors duration-300">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Medicine Categories</h3>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
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

      {/* Popular Medicines Trend */}
      <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/30 hover:bg-white/30 transition-colors duration-300">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Popular Medicines</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={popularData}>
            <defs>
              <linearGradient id="popularGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
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
              dataKey="quantity"
              stroke="#4CAF50"
              fillOpacity={1}
              fill="url(#popularGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
