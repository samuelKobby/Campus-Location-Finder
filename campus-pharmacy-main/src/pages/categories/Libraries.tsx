import React, { useState, useEffect } from 'react';
import { FaBook } from 'react-icons/fa';
import { CategoryLayout } from '../../components/category/CategoryLayout';
import { heroBackgrounds } from '../../utils/imageUrls';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useLocations } from '../../context/LocationContext';

interface DatabaseLibrary {
  id: string;
  name: string;
  description: string;
  address: string;
  image_url: string;
  contact_number: string;
  email: string;
  website_url: string;
  building_type: string;
  latitude: number;
  longitude: number;
  opening_hours: OpeningHours | string;
}

interface OpeningHours {
  open?: string;
  close?: string;
}

interface Location {
  id: string;
  name: string;
  description: string;
  building: string;
  floor: string;
  openingHours: string;
  image: string;
  tags: string[];
  getDirections?: () => void;
}

export const Libraries = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const { setLibraryLocations } = useLocations();

  const getDirectionsUrl = (latitude: number, longitude: number) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`;
  };

  const formatOpeningHours = (hours: OpeningHours | string | null): string => {
    if (!hours) return '8:00 AM - 10:00 PM';
    if (typeof hours === 'string') return hours;
    
    // If it's an object with open/close times
    if (hours.open && hours.close) {
      return `${hours.open} - ${hours.close}`;
    }
    
    return '8:00 AM - 10:00 PM';
  };

  useEffect(() => {
    fetchLibraries();
  }, []);

  const fetchLibraries = async () => {
    try {
      setLoading(true);
      
      const { data: libraryData, error } = await supabase
        .from('locations')
        .select(`
          id,
          name,
          description,
          image_url,
          opening_hours,
          building_type,
          latitude,
          longitude
        `)
        .eq('building_type', 'library')
        .order('name');

      if (error) throw error;

      if (libraryData) {
        const formattedLibraries: Location[] = (libraryData as DatabaseLibrary[]).map(library => ({
          id: library.id,
          name: library.name,
          description: library.description || 'A quiet space for study and research.',
          building: library.name,
          floor: 'All Floors',
          openingHours: formatOpeningHours(library.opening_hours),
          image: library.image_url || heroBackgrounds.libraries,
          tags: ['Study Spaces', 'Books', 'Research'],
          getDirections: library.latitude && library.longitude ? () => {
            const url = getDirectionsUrl(library.latitude, library.longitude);
            window.open(url, '_blank');
          } : undefined
        }));

        setLocations(formattedLibraries);
        setLibraryLocations(formattedLibraries); // Store in context
      }
    } catch (error: any) {
      toast.error('Error fetching libraries');
      console.error('Error fetching libraries:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: 'Libraries',
      value: `${locations.length}+`
    },
    {
      label: 'Study Spaces',
      value: '100+'
    },
    {
      label: 'Books',
      value: '500K+'
    }
  ];

  return (
    <CategoryLayout
      title="Libraries"
      description="Discover our extensive network of libraries and study spaces."
      icon={FaBook}
      locations={locations}
      backgroundImage={heroBackgrounds.libraries}
      stats={stats}
      loading={loading}
    />
  );
};
