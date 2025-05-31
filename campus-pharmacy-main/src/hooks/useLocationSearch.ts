import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { useLocations, Location as ContextLocation } from '../context/LocationContext';

export interface SearchResult extends ContextLocation {
  category: string;
}

export const useLocationSearch = () => {
  const {
    academicLocations,
    libraryLocations,
    diningLocations,
    sportsLocations,
    studentCenterLocations,
    healthLocations
  } = useLocations();

  const searchLocations = (query: string): SearchResult[] => {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return [];

    // Search through all category locations
    const allLocations = [
      ...academicLocations.map(loc => ({ ...loc, category: 'Academic Buildings' })),
      ...libraryLocations.map(loc => ({ ...loc, category: 'Libraries' })),
      ...diningLocations.map(loc => ({ ...loc, category: 'Dining Halls' })),
      ...sportsLocations.map(loc => ({ ...loc, category: 'Sports Facilities' })),
      ...studentCenterLocations.map(loc => ({ ...loc, category: 'Student Centers' })),
      ...healthLocations.map(loc => ({ ...loc, category: 'Health Services' }))
    ];

    return allLocations.filter(location => 
      location.name.toLowerCase().includes(searchTerm)
    );
  };

  return {
    searchLocations,
    loading: false
  };
};
