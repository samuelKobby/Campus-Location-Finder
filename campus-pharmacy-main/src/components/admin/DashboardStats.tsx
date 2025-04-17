import React, { useEffect, useState } from 'react';
import { FaUniversity, FaBook, FaUtensils, FaRunning } from 'react-icons/fa';
import { MdMeetingRoom } from 'react-icons/md';
import { supabase } from '../../lib/supabase';

interface StatsCardProps {
  title: string;
  value: number;
  previousValue?: number;
  icon: React.ElementType;
  color: string;
  isLoading?: boolean;
}

interface DashboardCounts {
  academicBuildings: number;
  libraries: number;
  diningHalls: number;
  sportsFacilities: number;
  studentCenters: number;
  previousWeek: {
    academicBuildings: number;
    libraries: number;
    diningHalls: number;
    sportsFacilities: number;
    studentCenters: number;
  };
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, previousValue, icon: Icon, color, isLoading }) => {
  const percentageChange = previousValue 
    ? ((value - previousValue) / previousValue * 100).toFixed(1)
    : '0';
  const isIncrease = Number(percentageChange) > 0;

  return (
    <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/30">
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
              <p className="text-2xl font-bold text-gray-800">{value}</p>
              <p className={`text-sm ${isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                {isIncrease ? '+' : ''}{percentageChange}% Previous Week
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const DashboardStats: React.FC = () => {
  const [stats, setStats] = useState<DashboardCounts>({
    academicBuildings: 0,
    libraries: 0,
    diningHalls: 0,
    sportsFacilities: 0,
    studentCenters: 0,
    previousWeek: {
      academicBuildings: 0,
      libraries: 0,
      diningHalls: 0,
      sportsFacilities: 0,
      studentCenters: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch current counts
      const { count: academicCount } = await supabase
        .from('locations')
        .select('*', { count: 'exact', head: true })
        .eq('building_type', 'academic');

      const { count: libraryCount } = await supabase
        .from('locations')
        .select('*', { count: 'exact', head: true })
        .eq('building_type', 'library');

      const { count: diningCount } = await supabase
        .from('locations')
        .select('*', { count: 'exact', head: true })
        .eq('building_type', 'dining');

      const { count: sportsCount } = await supabase
        .from('locations')
        .select('*', { count: 'exact', head: true })
        .eq('building_type', 'sports');

      const { count: centerCount } = await supabase
        .from('locations')
        .select('*', { count: 'exact', head: true })
        .eq('building_type', 'student_center');

      // Simulate previous week data (you should implement actual historical tracking)
      const previousWeek = {
        academicBuildings: Math.floor((academicCount || 0) * 0.9),
        libraries: Math.floor((libraryCount || 0) * 0.95),
        diningHalls: Math.floor((diningCount || 0) * 0.85),
        sportsFacilities: Math.floor((sportsCount || 0) * 1.1),
        studentCenters: Math.floor((centerCount || 0) * 0.92)
      };

      setStats({
        academicBuildings: academicCount || 0,
        libraries: libraryCount || 0,
        diningHalls: diningCount || 0,
        sportsFacilities: sportsCount || 0,
        studentCenters: centerCount || 0,
        previousWeek
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <StatsCard
        title="Academic Buildings"
        value={stats.academicBuildings}
        previousValue={stats.previousWeek.academicBuildings}
        icon={FaUniversity}
        color="bg-blue-600"
        isLoading={loading}
      />
      <StatsCard
        title="Libraries"
        value={stats.libraries}
        previousValue={stats.previousWeek.libraries}
        icon={FaBook}
        color="bg-purple-600"
        isLoading={loading}
      />
      <StatsCard
        title="Dining Halls"
        value={stats.diningHalls}
        previousValue={stats.previousWeek.diningHalls}
        icon={FaUtensils}
        color="bg-yellow-600"
        isLoading={loading}
      />
      <StatsCard
        title="Sports Facilities"
        value={stats.sportsFacilities}
        previousValue={stats.previousWeek.sportsFacilities}
        icon={FaRunning}
        color="bg-green-600"
        isLoading={loading}
      />
      <StatsCard
        title="Student Centers"
        value={stats.studentCenters}
        previousValue={stats.previousWeek.studentCenters}
        icon={MdMeetingRoom}
        color="bg-red-600"
        isLoading={loading}
      />
    </div>
  );
};