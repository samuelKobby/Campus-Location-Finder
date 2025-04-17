import React from 'react';
import { SearchBar } from '../components/home/SearchBar';
import { LocationCategories } from '../components/home/LocationCategories';

export const Home: React.FC = () => {
  return (
    <div className="relative overflow-x-hidden min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section with Search */}
      <div className="relative h-[600px] flex items-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("./public/images/DALL·E 2025-03-22 13.03.18 - A clean and minimalistic 3D illustration of a university campus for a Campus Guide web app. The scene includes a few modern buildings, green trees, an.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/40"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 text-white">
            Find Your Way Around Campus
          </h1>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Quickly locate classrooms, offices, facilities, and more with our interactive campus map
          </p>
          <SearchBar />
        </div>
      </div>

      {/* Main Content Section */}
      <div className="relative z-20 -mt-3 pb-24">
        <div className="container mx-auto px-4">
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Quick Navigation */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
              <div className="text-blue-600 mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quick Navigation</h3>
              <p className="text-gray-600">Find your destination with our intuitive campus navigation system</p>
            </div>

            {/* Real-time Updates */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
              <div className="text-blue-600 mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
              <p className="text-gray-600">Stay informed with live updates about campus facilities and events</p>
            </div>

            {/* Interactive Map */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
              <div className="text-blue-600 mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Interactive Map</h3>
              <p className="text-gray-600">Explore campus locations with our detailed interactive map</p>
            </div>
          </div>

          {/* Categories Section */}
          <div className="py-16">
            <h2 className="text-3xl font-bold text-center mb-12">Browse by Category</h2>
            <LocationCategories />
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Buildings</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
              <div className="text-gray-600">Classrooms</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">20+</div>
              <div className="text-gray-600">Facilities</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">10+</div>
              <div className="text-gray-600">Study Areas</div>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-16">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-semibold mb-4">Student Resources</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                  Study Areas
                </li>
                <li className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                  Libraries
                </li>
                <li className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                  Computer Labs
                </li>
              </ul>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-semibold mb-4">Campus Life</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                  Student Centers
                </li>
                <li className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                  Dining Halls
                </li>
                <li className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                  Sports Facilities
                </li>
              </ul>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 md:col-span-2 lg:col-span-1">
              <h3 className="text-2xl font-semibold mb-4">Getting Around</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                  Parking Lots
                </li>
                <li className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                  Shuttle Stops
                </li>
                <li className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                  Bike Racks
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};