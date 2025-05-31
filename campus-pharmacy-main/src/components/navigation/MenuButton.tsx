import React from 'react';

interface MenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export const MenuButton: React.FC<MenuButtonProps> = ({ isOpen, onClick }) => (
  <button
    onClick={onClick}
    className="md:hidden p-2 text-white hover:bg-blue-600 rounded"
    aria-label="Toggle menu"
  >
    <MenuIcon isOpen={isOpen} />
  </button>
);

const MenuIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    {isOpen ? (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    ) : (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    )}
  </svg>
);