import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { Sidebar } from '../../components/admin/Sidebar';
import { Header } from '../../components/admin/Header';
import { DashboardStats } from '../../components/admin/DashboardStats';
import { DashboardCharts } from '../../components/admin/DashboardCharts';
import { Analytics } from './Analytics';
import { PharmacyManagement } from './Categories';
import { Inventory } from './Inventory';
import { Notifications } from './Notifications';
import { Users } from './Users';
import { Settings } from './Settings';
import { AcademicBuildingsManagement } from './locations/AcademicBuildings';
import { LibrariesManagement } from './locations/Libraries';
import { DiningHallsManagement } from './locations/DiningHalls';
import { SportsFacilitiesManagement } from './locations/SportsFacilities';
import { StudentCentersManagement } from './locations/StudentCenters';
import { HealthServicesManagement } from './locations/HealthServices';
import { supabase } from '../../lib/supabase';
import { ModalProvider, useModal } from '../../contexts/ModalContext';

interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

const useAdminAuth = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (sessionError || !session?.user) {
          throw new Error('No session found');
        }

        const adminData = {
          id: session.user.id,
          full_name: session.user.email?.split('@')[0] || 'Admin User',
          email: session.user.email || '',
          role: 'Admin'
        };

        setAdminUser(adminData);
        localStorage.setItem('adminUser', JSON.stringify(adminData));
      } catch (error) {
        console.error('Error checking auth:', error);
        if (mounted) {
          setAdminUser(null);
          localStorage.removeItem('adminUser');
          navigate('/admin/login');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        setAdminUser(null);
        localStorage.removeItem('adminUser');
        localStorage.removeItem('sb-access-token');
        localStorage.removeItem('sb-refresh-token');
        navigate('/admin/login');
      } else if (event === 'SIGNED_IN' && session) {
        const adminData = {
          id: session.user.id,
          full_name: session.user.email?.split('@')[0] || 'Admin User',
          email: session.user.email || '',
          role: 'Admin'
        };
        setAdminUser(adminData);
        localStorage.setItem('adminUser', JSON.stringify(adminData));
      }
      setLoading(false);
    });

    checkAuth();

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [navigate]);

  return { adminUser, loading };
};

const DashboardHome: React.FC = () => (
  <div className="space-y-6">
    <DashboardStats />
    <DashboardCharts />
  </div>
);

const DashboardContent: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { adminUser, loading } = useAdminAuth();
  const { isModalOpen } = useModal();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!adminUser) {
    return null;
  }

  return (
    <div className="flex h-screen relative overflow-hidden bg-gradient-to-br from-blue-100 via-indigo-50 to-violet-50">
      {/* Main gradient orbs */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-radial from-blue-500/30 via-indigo-400/20 to-transparent rounded-full transform -translate-x-1/2 -translate-y-1/2 blur-3xl mix-blend-overlay pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-violet-500/30 via-purple-400/20 to-transparent rounded-full transform translate-x-1/3 translate-y-1/3 blur-3xl mix-blend-overlay pointer-events-none -z-10"></div>
      
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
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          adminName={adminUser.full_name}
          onMenuClick={() => setIsSidebarOpen(true)}
          isVisible={!isModalOpen}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8 relative z-0">
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/pharmacies" element={<PharmacyManagement />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/users" element={<Users />} />
              <Route path="/settings" element={<Settings />} />
              
              {/* Location Management Routes */}
              <Route path="/locations/academic" element={<AcademicBuildingsManagement />} />
              <Route path="/locations/libraries" element={<LibrariesManagement />} />
              <Route path="/locations/dining" element={<DiningHallsManagement />} />
              <Route path="/locations/sports" element={<SportsFacilitiesManagement />} />
              <Route path="/locations/student-centers" element={<StudentCentersManagement />} />
              <Route path="/locations/health-services" element={<HealthServicesManagement />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  return (
    <ModalProvider>
      <DashboardContent />
    </ModalProvider>
  );
};