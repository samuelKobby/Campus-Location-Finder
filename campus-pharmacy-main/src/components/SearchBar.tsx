import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from './ui/Icon';

export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for medications..."
          className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Icon name="Sparkles" className="h-6 w-6 text-gray-400" />
        </div>
      </div>
    </form>
  );
};