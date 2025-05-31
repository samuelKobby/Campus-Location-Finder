import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PharmacyAuthContextType {
  pharmacyId: string | null;
  pharmacyName: string | null;
  isAuthenticated: boolean;
  logout: () => void;
}

const PharmacyAuthContext = createContext<PharmacyAuthContextType | undefined>(undefined);

export const PharmacyAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pharmacyId, setPharmacyId] = useState<string | null>(() => localStorage.getItem('pharmacyId'));
  const [pharmacyName, setPharmacyName] = useState<string | null>(() => localStorage.getItem('pharmacyName'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const storedPharmacyId = localStorage.getItem('pharmacyId');
    const storedPharmacyName = localStorage.getItem('pharmacyName');
    const userRole = localStorage.getItem('userRole');
    return !!(storedPharmacyId && storedPharmacyName && userRole === 'pharmacy');
  });
  const navigate = useNavigate();

  const checkAuth = () => {
    const storedPharmacyId = localStorage.getItem('pharmacyId');
    const storedPharmacyName = localStorage.getItem('pharmacyName');
    const userRole = localStorage.getItem('userRole');

    if (storedPharmacyId && storedPharmacyName && userRole === 'pharmacy') {
      setPharmacyId(storedPharmacyId);
      setPharmacyName(storedPharmacyName);
      setIsAuthenticated(true);
      return true;
    } else {
      setPharmacyId(null);
      setPharmacyName(null);
      setIsAuthenticated(false);
      return false;
    }
  };

  useEffect(() => {
    window.addEventListener('storage', checkAuth);
    window.addEventListener('pharmacyAuthChange', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('pharmacyAuthChange', checkAuth);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('pharmacyId');
    localStorage.removeItem('pharmacyName');
    localStorage.removeItem('userRole');
    setPharmacyId(null);
    setPharmacyName(null);
    setIsAuthenticated(false);
    navigate('/', { replace: true });
  };

  return (
    <PharmacyAuthContext.Provider value={{ pharmacyId, pharmacyName, isAuthenticated, logout }}>
      {children}
    </PharmacyAuthContext.Provider>
  );
};

export const usePharmacyAuth = () => {
  const context = useContext(PharmacyAuthContext);
  if (context === undefined) {
    throw new Error('usePharmacyAuth must be used within a PharmacyAuthProvider');
  }
  return context;
};

export const RequirePharmacyAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = usePharmacyAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/pharmacy/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? <>{children}</> : null;
};
