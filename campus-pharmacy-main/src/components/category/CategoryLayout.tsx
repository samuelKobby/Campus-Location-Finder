import React, { useState } from 'react';
import { FaMapMarkerAlt, FaSearch, FaFilter } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { CategoryHero } from './CategoryHero';
import { IconType } from 'react-icons';
import { Location } from '../../context/LocationContext';

interface CategoryLayoutProps {
  title: string;
  description: string;
  icon: IconType;
  locations: Location[];
  backgroundImage: string;
  stats?: Array<{
    label: string;
    value: string;
  }>;
  loading?: boolean;
}

export const CategoryLayout: React.FC<CategoryLayoutProps> = ({
  title,
  description,
  icon,
  locations,
  backgroundImage,
  stats,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get all unique tags
  const allTags = Array.from(
    new Set(
      locations.flatMap(location => location.tags || [])
    )
  );

  // Filter locations based on search term and selected tags
  const filteredLocations = locations.filter(location => {
    const matchesSearch = 
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.building.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTags = 
      selectedTags.length === 0 ||
      selectedTags.every(tag => location.tags?.includes(tag));

    return matchesSearch && matchesTags;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <CategoryHero
        title={title}
        description={description}
        icon={icon}
        backgroundImage={backgroundImage}
        stats={stats}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search locations..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <FaFilter className="text-gray-400" />
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Locations Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredLocations.map((location) => (
                <motion.div
                  key={location.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <img
                    className="h-48 w-full object-cover"
                    src={location.image}
                    alt={location.name}
                  />
                  <div className="p-4">
                    <h2 className="text-xl font-bold mb-2">{location.name}</h2>
                    <p className="text-gray-600 mb-4">{location.description}</p>
                    <div className="space-y-2 text-gray-600">
                      <p className="flex items-center">
                        <FaMapMarkerAlt className="mr-2" />
                        {location.building}
                      </p>
                      {location.openingHours && (
                        <p className="flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {location.openingHours}
                        </p>
                      )}
                    </div>
                    {location.tags && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {location.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {location.getDirections && (
                      <button
                        onClick={location.getDirections}
                        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Get Directions
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* No Results */}
            {filteredLocations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  No locations found matching your search criteria.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
