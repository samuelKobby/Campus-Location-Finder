import React, { useEffect, useState } from 'react';
import { FaUtensils } from 'react-icons/fa';
import { CategoryLayout } from '../../components/category/CategoryLayout';
import { heroBackgrounds } from '../../utils/imageUrls';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useLocations, Location } from '../../context/LocationContext';

interface OpeningHours {
  open?: string;
  close?: string;
}

interface DatabaseLocation {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  opening_hours: OpeningHours | null;
  building_type: string;
  latitude: number;
  longitude: number;
}

export const DiningHalls = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const { setDiningLocations } = useLocations();

  const getDirectionsUrl = (latitude: number, longitude: number) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`;
  };

  const formatOpeningHours = (hours: OpeningHours | string | null): string => {
    if (!hours) return '7:00 AM - 9:00 PM';
    if (typeof hours === 'string') return hours;
    
    // If it's an object with open/close times
    if (hours.open && hours.close) {
      return `${hours.open} - ${hours.close}`;
    }
    
    return '7:00 AM - 9:00 PM';
  };

  useEffect(() => {
    fetchDiningHalls();
  }, []);

  const fetchDiningHalls = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
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
        .eq('building_type', 'dining')
        .order('name');

      if (error) throw error;

      if (data) {
        const formattedLocations: Location[] = (data as DatabaseLocation[]).map(hall => ({
          id: hall.id,
          name: hall.name,
          description: hall.description || 'Campus dining location offering fresh, delicious meals.',
          building: hall.name,
          openingHours: formatOpeningHours(hall.opening_hours),
          image: hall.image_url || heroBackgrounds.diningHalls,
          tags: ['Dining', 'Cafeteria', 'Food Court'],
          getDirections: hall.latitude && hall.longitude ? () => {
            const url = getDirectionsUrl(hall.latitude, hall.longitude);
            window.open(url, '_blank');
          } : undefined
        }));

        setLocations(formattedLocations);
        setDiningLocations(formattedLocations);
      }
    } catch (error: any) {
      toast.error('Error fetching dining halls');
      console.error('Error fetching dining halls:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: 'Dining Halls',
      value: `${locations.length}+`
    },
    {
      label: 'Daily Meals',
      value: '1000+'
    },
    {
      label: 'Menu Items',
      value: '100+'
    }
  ];

  return (
    <CategoryLayout
      title="Dining Halls"
      description="Explore our diverse campus dining options and meal services."
      icon={FaUtensils}
      locations={locations}
      backgroundImage={heroBackgrounds.diningHalls}
      stats={stats}
      loading={loading}
    />
  );
};
