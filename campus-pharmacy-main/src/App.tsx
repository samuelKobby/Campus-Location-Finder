import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { MainLayout } from './components/layouts/MainLayout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { AcademicBuildings } from './pages/categories/AcademicBuildings';
import { Libraries } from './pages/categories/Libraries';
import { DiningHalls } from './pages/categories/DiningHalls';
import { SportsFacilities } from './pages/categories/SportsFacilities';
import { StudentCenters } from './pages/categories/StudentCenters';
import { HealthServices } from './pages/categories/HealthServices';
import { Medicines } from './pages/Medicines';
import { MedicineDetails } from './pages/MedicineDetails';
import { Pharmacies } from './pages/Pharmacies';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminSignup } from './pages/admin/AdminSignup';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { PharmacyLogin } from './pages/PharmacyLogin';
import { PharmacyDashboard } from './pages/pharmacy/PharmacyDashboard';
import { Privacy } from './pages/Privacy';
import { PharmacyAuthProvider, RequirePharmacyAuth } from './contexts/PharmacyAuthContext';
import { LocationProvider } from './context/LocationContext';
import { LocationLoader } from './components/LocationLoader';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('adminUser') !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <LocationProvider>
        <LocationLoader />
        <Routes>
          {/* Auth Routes - Outside MainLayout */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignup />} />
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/pharmacy/login" element={<PharmacyLogin />} />
          <Route path="/pharmacy/*" element={
            <PharmacyAuthProvider>
              <RequirePharmacyAuth>
                <PharmacyDashboard />
              </RequirePharmacyAuth>
            </PharmacyAuthProvider>
          } />

          {/* Main Layout Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            
            {/* Category Routes */}
            <Route path="category">
              <Route path="academic" element={<AcademicBuildings />} />
              <Route path="libraries" element={<Libraries />} />
              <Route path="dining" element={<DiningHalls />} />
              <Route path="sports" element={<SportsFacilities />} />
              <Route path="student-centers" element={<StudentCenters />} />
              <Route path="health" element={<HealthServices />} />
            </Route>

            {/* Medicine Routes */}
            <Route path="medicines" element={<Medicines />} />
            <Route path="medicine/:id" element={<MedicineDetails />} />
            <Route path="pharmacies" element={<Pharmacies />} />

            {/* Other Routes */}
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="privacy" element={<Privacy />} />
          </Route>
        </Routes>
      </LocationProvider>
    </Router>
  );
}

export default App;