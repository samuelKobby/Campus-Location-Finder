import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useLocationSearch, SearchResult } from '../../hooks/useLocationSearch';

export const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();
  const { searchLocations, loading } = useLocationSearch();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const results = searchLocations(searchQuery);
    setSearchResults(results);
    // Navigate to results page with search query as parameter
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleLocationClick = (location: SearchResult, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (location.getDirections) {
      location.getDirections();
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              // Update search results in real-time as user types
              if (!e.target.value.trim()) {
                setSearchResults([]);
                return;
              }
              const results = searchLocations(e.target.value);
              setSearchResults(results);
            }}
            placeholder="Search for a location..."
            className="w-full px-6 py-4 text-lg text-gray-900 bg-white bg-opacity-95 backdrop-blur-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-xl border border-white/20"
          />
          <button
            type="submit"
            className="absolute right-4 p-2 text-blue-600 hover:text-blue-800 transition-colors"
            aria-label="Search"
          >
            <FaSearch size={20} />
          </button>
        </div>
      </form>
      
      {/* Show instant search results only when there's a query */}
      {searchQuery.trim() && (
        <div className="max-w-2xl mx-auto mt-2">
          {loading ? (
            <div className="bg-white rounded-lg shadow-lg p-4 text-center text-gray-600">
              Loading...
            </div>
          ) : searchResults.length > 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto">
              {searchResults.map((location: SearchResult) => (
                <div 
                  key={location.id}
                  onClick={(e) => handleLocationClick(location, e)}
                  className="p-3 hover:bg-gray-100 rounded cursor-pointer flex items-center justify-between"
                >
                  <span className="font-medium">{location.name}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    {location.category}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-4 text-center text-gray-600">
              No locations found
            </div>
          )}
        </div>
      )}
    </div>
  );
};
