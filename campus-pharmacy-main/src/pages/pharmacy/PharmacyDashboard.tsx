import React, { useEffect, useState } from 'react';
import { usePharmacyAuth } from '../../contexts/PharmacyAuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { PharmacySidebar } from '../../components/pharmacy/PharmacySidebar';
import { PharmacyHeader } from '../../components/pharmacy/PharmacyHeader';
import { PharmacyStats } from '../../components/pharmacy/PharmacyStats';
import { PharmacyCharts } from '../../components/pharmacy/PharmacyCharts';
import { PharmacyLayout } from '../../components/pharmacy/PharmacyLayout';
import { PharmacyHours } from './PharmacyHours';
import { PharmacyInventory } from './PharmacyInventory';
import { PharmacyNotifications } from './PharmacyNotifications';
import { PharmacySettings } from './PharmacySettings';

interface Medicine {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  unit: string;
}

interface MedicineWithQuantity extends Medicine {
  quantity: number;
}

// Raw shape of data from Supabase join query
type SupabaseJoinRow = {
  quantity: any;
  medicines: {
    id: any;
    name: any;
    category: any;
    price: any;
    description: any;
    unit: any;
  }[];
}

interface DashboardStats {
  totalMedicines: number;
  inStock: number;
  outOfStock: number;
  lowStock: number;
  popularMedicines: MedicineWithQuantity[];
  categoryDistribution: Array<[string, number]>;
}

const DashboardHome: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalMedicines: 0,
    inStock: 0,
    outOfStock: 0,
    lowStock: 0,
    popularMedicines: [],
    categoryDistribution: []
  });
  const { pharmacyId } = usePharmacyAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!pharmacyId) {
      navigate('/', { replace: true });
      return;
    }

    const initializeDashboard = async () => {
      try {
        setLoading(true);

        // Get all medicine-pharmacy relationships for this pharmacy
        const { data, error: relationError } = await supabase
          .from('medicine_pharmacies')
          .select(`
            quantity,
            medicines (
              id,
              name,
              category,
              price,
              description,
              unit
            )
          `)
          .eq('pharmacy_id', pharmacyId);

        if (relationError) throw relationError;

        // Format medicine data
        const medicineItems: MedicineWithQuantity[] = (data as SupabaseJoinRow[] || []).map(item => ({
          id: item.medicines[0]?.id,
          name: item.medicines[0]?.name,
          category: item.medicines[0]?.category,
          quantity: Number(item.quantity) || 0,
          price: Number(item.medicines[0]?.price) || 0,
          description: item.medicines[0]?.description,
          unit: item.medicines[0]?.unit
        }));

        // Calculate dashboard stats
        const dashboardStats: DashboardStats = {
          totalMedicines: medicineItems.length,
          inStock: medicineItems.filter(m => m.quantity > 0).length,
          outOfStock: medicineItems.filter(m => m.quantity === 0).length,
          lowStock: medicineItems.filter(m => m.quantity > 0 && m.quantity <= 10).length,
          popularMedicines: medicineItems
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5),
          categoryDistribution: Object.entries(
            medicineItems.reduce((acc, med) => {
              acc[med.category] = (acc[med.category] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          )
        };

        setStats(dashboardStats);
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [navigate, pharmacyId]);

  return (
    <div className="space-y-6">
      <PharmacyStats
        totalMedicines={stats.totalMedicines}
        inStock={stats.inStock}
        outOfStock={stats.outOfStock}
        lowStock={stats.lowStock}
        loading={loading}
      />
      <PharmacyCharts
        popularMedicines={stats.popularMedicines}
        categoryDistribution={stats.categoryDistribution}
      />
    </div>
  );
};

export const PharmacyDashboard: React.FC = () => {
  const { pharmacyId } = usePharmacyAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pharmacyName, setPharmacyName] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPharmacyDetails = async () => {
      if (!pharmacyId) {
        navigate('/', { replace: true });
        return;
      }

      try {
        const { data: pharmacyData, error } = await supabase
          .from('pharmacies')
          .select('name')
          .eq('id', pharmacyId)
          .single();

        if (error) throw error;

        if (pharmacyData) {
          setPharmacyName(pharmacyData.name);
        }
      } catch (error) {
        console.error('Error fetching pharmacy details:', error);
        toast.error('Error loading pharmacy details');
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacyDetails();
  }, [pharmacyId, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <PharmacyLayout>
      <div className="flex h-screen relative overflow-hidden bg-gradient-to-br from-indigo-100 via-rose-50 to-white">
        {/* Main gradient orbs */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-radial from-violet-400/30 via-fuchsia-400/20 to-transparent rounded-full transform -translate-x-1/2 -translate-y-1/2 blur-3xl mix-blend-overlay pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-teal-400/30 via-emerald-400/20 to-transparent rounded-full transform translate-x-1/4 translate-y-1/4 blur-3xl mix-blend-overlay pointer-events-none -z-10"></div>
        
        {/* Accent gradients */}
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-gradient-radial from-sky-400/20 via-blue-400/10 to-transparent rounded-full transform -translate-x-1/2 -translate-y-1/2 blur-2xl mix-blend-overlay animate-pulse pointer-events-none -z-10"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-gradient-radial from-amber-400/20 via-orange-400/10 to-transparent rounded-full blur-2xl mix-blend-overlay animate-pulse pointer-events-none -z-10"></div>
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-radial from-rose-400/20 via-pink-400/10 to-transparent rounded-full blur-2xl mix-blend-overlay animate-pulse pointer-events-none -z-10"></div>
      {/* Mobile sidebar backdrop */}
      <div
        className={`fixed inset-0 bg-gray-600 bg-opacity-75 z-20 transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />
      
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 transition duration-300 ease-in-out z-30 lg:z-0`}
      >
        <PharmacySidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <PharmacyHeader 
          pharmacyName={pharmacyName}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8 bg-transparent relative z-0">
            <Routes>
              <Route path="dashboard" element={<DashboardHome />} />
              <Route path="hours" element={<PharmacyHours />} />
              <Route path="inventory" element={<PharmacyInventory />} />
              <Route path="notifications" element={<PharmacyNotifications />} />
              <Route path="settings" element={<PharmacySettings />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </div>
        </main>
        </div>
      </div>
    </PharmacyLayout>
  );
};
