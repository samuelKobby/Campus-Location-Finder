import { useLocation } from 'react-router-dom';
import { useScrollPosition } from './useScrollPosition';

export const useNavbarStyle = (isMenuOpen: boolean) => {
  const location = useLocation();
  const scrollPosition = useScrollPosition();
  
  const isHomePage = location.pathname === '/';
  const shouldBeTransparent = scrollPosition < 100 && isHomePage && !isMenuOpen;
  
  const baseClasses = 'fixed top-0 left-0 right-0 z-50 transition-all duration-300';
  const backgroundClasses = shouldBeTransparent
    ? 'bg-transparent'
    : 'bg-blue-500 shadow-md';

  return {
    navbarClass: `${baseClasses} ${backgroundClasses}`,
    isTransparent: shouldBeTransparent,
  };
};