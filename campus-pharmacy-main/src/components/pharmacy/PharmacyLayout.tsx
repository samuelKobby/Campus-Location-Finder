import React, { useState, useEffect } from 'react';
import { ChangePasswordModal } from './ChangePasswordModal';

interface PharmacyLayoutProps {
  children: React.ReactNode;
}

export const PharmacyLayout: React.FC<PharmacyLayoutProps> = ({ children }) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Check if password change is required (for first login)
  useEffect(() => {
    const requirePasswordChange = localStorage.getItem('requirePasswordChange');
    if (requirePasswordChange === 'true') {
      setShowPasswordModal(true);
    }
  }, []);

  // Create a global event listener for showing the password modal
  useEffect(() => {
    const handleShowPasswordModal = () => {
      setShowPasswordModal(true);
    };

    // Add event listener
    window.addEventListener('showPasswordModal', handleShowPasswordModal);

    // Clean up
    return () => {
      window.removeEventListener('showPasswordModal', handleShowPasswordModal);
    };
  }, []);

  return (
    <>
      {children}
      
      {/* Change Password Modal - rendered at the page level */}
      <ChangePasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
      />
    </>
  );
};
