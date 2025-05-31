import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MobileMenu } from './MobileMenu';
import { DesktopNav } from './DesktopNav';
import { Logo } from './Logo';
import { MenuButton } from './MenuButton';
import { useNavbarStyle } from '../../hooks/useNavbarStyle';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { navbarClass } = useNavbarStyle(isMenuOpen);

  return (
    <>
      <nav className={navbarClass}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Logo />
            <DesktopNav />
            <MenuButton 
              isOpen={isMenuOpen} 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
            />
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 ${isMenuOpen ? 'block' : 'hidden'}`}>
          <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </div>
      </nav>
      {/* Spacer for fixed navbar */}
      <div className={`h-16 ${navbarClass.includes('bg-transparent') ? 'hidden' : ''}`} />
    </>
  );
};