import React from 'react';
import { SearchInput } from './SearchInput';
import { useSearch } from '../../hooks/useSearch';

export const SearchBar: React.FC = () => {
  const { query, setQuery, handleSearch } = useSearch();

  return (
    <div className="w-full max-w-2xl mx-auto">
      <SearchInput
        value={query}
        onChange={setQuery}
        onSubmit={() => handleSearch(query)}
      />
    </div>
  );
};