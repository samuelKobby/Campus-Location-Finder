import React from 'react';
import { Link } from 'react-router-dom';

export const QuickLinks: React.FC = () => {
  return (
    <section className="text-center">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/pharmacies" className="text-indigo-600 hover:text-indigo-700 font-medium">
          Find Pharmacies
        </Link>
        <Link to="/about" className="text-indigo-600 hover:text-indigo-700 font-medium">
          About Us
        </Link>
        <Link to="/contact" className="text-indigo-600 hover:text-indigo-700 font-medium">
          Contact
        </Link>
      </div>
    </section>
  );
};