import React from 'react';
import { Package2, AlertTriangle, TrendingUp } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  previousValue?: number;
  icon: React.ElementType;
  color: string;
  isLoading?: boolean;
}

interface PharmacyStatsProps {
  totalMedicines: number;
  inStock: number;
  outOfStock: number;
  lowStock: number;
  loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, previousValue, icon: Icon, color, isLoading }) => {
  const percentageChange = previousValue 
    ? ((value - previousValue) / previousValue * 100).toFixed(1)
    : '0';
  const isIncrease = Number(percentageChange) > 0;

  return (
    <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/30 hover:bg-white/30 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <div className={`rounded-full p-3 ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-right">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          {isLoading ? (
            <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div>
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className={`text-sm ${isIncrease ? 'text-green-500' : 'text-red-500'}`}>
                {isIncrease ? '+' : ''}{percentageChange}% Previous Week
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const PharmacyStats: React.FC<PharmacyStatsProps> = ({
  totalMedicines,
  inStock,
  outOfStock,
  lowStock,
  loading = false
}) => {
  // Simulate previous week data (you should implement actual historical tracking)
  const previousWeek = {
    totalMedicines: Math.floor(totalMedicines * 0.9),
    inStock: Math.floor(inStock * 0.95),
    outOfStock: Math.floor(outOfStock * 1.1),
    lowStock: Math.floor(lowStock * 0.85)
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Total Medicines"
        value={totalMedicines}
        previousValue={previousWeek.totalMedicines}
        icon={Package2}
        color="bg-blue-600"
        isLoading={loading}
      />
      <StatsCard
        title="In Stock"
        value={inStock}
        previousValue={previousWeek.inStock}
        icon={TrendingUp}
        color="bg-green-600"
        isLoading={loading}
      />
      <StatsCard
        title="Out of Stock"
        value={outOfStock}
        previousValue={previousWeek.outOfStock}
        icon={AlertTriangle}
        color="bg-red-600"
        isLoading={loading}
      />
      <StatsCard
        title="Low Stock"
        value={lowStock}
        previousValue={previousWeek.lowStock}
        icon={AlertTriangle}
        color="bg-yellow-600"
        isLoading={loading}
      />
    </div>
  );
};
