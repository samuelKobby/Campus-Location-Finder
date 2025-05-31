import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = useCallback((searchQuery: string) => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  }, [navigate]);

  return {
    query,
    setQuery,
    handleSearch,
  };
};