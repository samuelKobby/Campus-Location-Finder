import React, { useState, useEffect } from 'react';
import { FaRunning } from 'react-icons/fa';
import { CategoryLayout } from '../../components/category/CategoryLayout';
import { heroBackgrounds } from '../../utils/imageUrls';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useLocations } from '../../context/LocationContext';

interface DatabaseSportsFacility {
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
  sports_facilities: {
    indoor_courts: number;
    outdoor_courts: number;
    equipment_available: boolean;
    facilities: string[];
    opening_hours: OpeningHours | string | null;
  } | null;
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

export const SportsFacilities = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    facilities: 0,
    indoorCourts: 0,
    outdoorCourts: 0
  });
  const { setSportsLocations } = useLocations();

  const getDirectionsUrl = (latitude: number, longitude: number) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`;
  };

  const formatOpeningHours = (hours: OpeningHours | string | null): string => {
    if (!hours) return '6:00 AM - 10:00 PM';
    if (typeof hours === 'string') return hours;
    
    // If it's an object with open/close times
    if (hours.open && hours.close) {
      return `${hours.open} - ${hours.close}`;
    }
    
    return '6:00 AM - 10:00 PM';
  };

  useEffect(() => {
    fetchSportsFacilities();
  }, []);

  const fetchSportsFacilities = async () => {
    try {
      setLoading(true);
      
      const { data: sportsData, error } = await supabase
        .from('locations')
        .select(`
          *,
          sports_facilities(*)
        `)
        .eq('building_type', 'sports')
        .order('name');

      if (error) throw error;

      if (sportsData) {
        const formattedFacilities: Location[] = (sportsData as DatabaseSportsFacility[]).map(facility => ({
          id: facility.id,
          name: facility.name,
          description: facility.description || '',
          building: facility.name,
          floor: facility.sports_facilities?.indoor_courts ? 'Indoor & Outdoor' : 'Outdoor',
          openingHours: formatOpeningHours(facility.sports_facilities?.opening_hours || null),
          image: facility.image_url || heroBackgrounds.sportsFacilities,
          tags: facility.sports_facilities?.facilities || [],
          getDirections: facility.latitude && facility.longitude ? () => {
            const url = getDirectionsUrl(facility.latitude, facility.longitude);
            window.open(url, '_blank');
          } : undefined
        }));

        setLocations(formattedFacilities);
        setSportsLocations(formattedFacilities); // Store in context

        // Calculate stats
        const totalStats = {
          facilities: sportsData.length,
          indoorCourts: sportsData.reduce((sum, facility) => sum + (facility.sports_facilities?.indoor_courts || 0), 0),
          outdoorCourts: sportsData.reduce((sum, facility) => sum + (facility.sports_facilities?.outdoor_courts || 0), 0)
        };

        setStats(totalStats);
      }
    } catch (error: any) {
      toast.error(error.message);
      console.error('Error fetching sports facilities:', error);
    } finally {
      setLoading(false);
    }
  };

  const formattedStats = [
    {
      label: 'Facilities',
      value: `${stats.facilities}+`
    },
    {
      label: 'Indoor Courts',
      value: `${stats.indoorCourts}+`
    },
    {
      label: 'Outdoor Courts',
      value: `${stats.outdoorCourts}+`
    }
  ];

  return (
    <CategoryLayout
      title="Sports Facilities"
      description="Stay active and healthy with our modern sports facilities and recreational areas."
      icon={FaRunning}
      locations={locations}
      backgroundImage={heroBackgrounds.sportsFacilities}
      stats={formattedStats}
      loading={loading}
    />
  );
};
