import React from 'react';
import { Link } from 'react-router-dom';

export const HeroSection: React.FC = () => (
  <div className="relative w-full h-[calc(100vh-0px)] -mt-[64px]">
    <div className="absolute inset-0">
      <img
        src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80"
        alt="Pharmacy background"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40"></div>
    </div>
    
    <div className="relative h-full flex items-center justify-center">
      <div className="container mx-auto text-center text-white">
        <h1 className="text-6xl font-bold mb-6 drop-shadow-lg">Pharma Finder</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto drop-shadow-md">
          Find medicines and campus pharmacies near you with real-time availability information.
        </p>
        <Link 
          to="/medicines" 
          className="inline-block bg-blue-500 text-white px-8 py-3 rounded-lg text-lg font-semibold 
                   hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 
                   shadow-lg hover:shadow-xl"
        >
          Find Medicines
        </Link>
      </div>
    </div>
  </div>
);