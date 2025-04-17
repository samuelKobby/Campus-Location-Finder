import React, { useState, useEffect } from 'react';
import { FaUniversity } from 'react-icons/fa';
import { CategoryLayout } from '../../components/category/CategoryLayout';
import { heroBackgrounds } from '../../utils/imageUrls';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useLocations } from '../../context/LocationContext';

interface DatabaseBuilding {
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
  academic_buildings: {
    floor_count: number;
    classroom_count: number;
    lab_count: number;
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

export const AcademicBuildings = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    buildings: 0,
    classrooms: 0,
    labs: 0
  });
  const { setAcademicLocations } = useLocations();

  const getDirectionsUrl = (latitude: number, longitude: number) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`;
  };

  const formatOpeningHours = (hours: OpeningHours | string | null): string => {
    if (!hours) return '7:00 AM - 10:00 PM';
    if (typeof hours === 'string') return hours;
    
    // If it's an object with open/close times
    if (hours.open && hours.close) {
      return `${hours.open} - ${hours.close}`;
    }
    
    return '7:00 AM - 10:00 PM';
  };

  useEffect(() => {
    fetchAcademicBuildings();
  }, []);

  const fetchAcademicBuildings = async () => {
    try {
      setLoading(true);
      
      // Fetch academic buildings
      const { data: buildingsData, error } = await supabase
        .from('locations')
        .select(`
          *,
          academic_buildings(*)
        `)
        .eq('building_type', 'academic')
        .order('name');

      if (error) throw error;

      if (buildingsData) {
        const formattedBuildings: Location[] = (buildingsData as DatabaseBuilding[]).map(building => ({
          id: building.id,
          name: building.name,
          description: building.description || '',
          building: building.name,
          floor: `${building.academic_buildings?.floor_count || 1} Floor${building.academic_buildings?.floor_count !== 1 ? 's' : ''}`,
          openingHours: formatOpeningHours(building.academic_buildings?.opening_hours || null),
          image: building.image_url || heroBackgrounds.academicBuildings,
          tags: building.academic_buildings?.facilities || [],
          getDirections: building.latitude && building.longitude ? () => {
            const url = getDirectionsUrl(building.latitude, building.longitude);
            window.open(url, '_blank');
          } : undefined
        }));

        setLocations(formattedBuildings);
        setAcademicLocations(formattedBuildings); // Store in context

        // Calculate stats
        const totalStats = {
          buildings: buildingsData.length,
          classrooms: buildingsData.reduce((sum, building) => sum + (building.academic_buildings?.classroom_count || 0), 0),
          labs: buildingsData.reduce((sum, building) => sum + (building.academic_buildings?.lab_count || 0), 0)
        };

        setStats(totalStats);
      }
    } catch (error: any) {
      toast.error(error.message);
      console.error('Error fetching academic buildings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formattedStats = [
    {
      label: 'Buildings',
      value: `${stats.buildings}+`
    },
    {
      label: 'Classrooms',
      value: `${stats.classrooms}+`
    },
    {
      label: 'Labs',
      value: `${stats.labs}+`
    }
  ];

  return (
    <CategoryLayout
      title="Academic Buildings"
      description="Explore our modern academic facilities equipped with state-of-the-art technology and learning spaces."
      icon={FaUniversity}
      locations={locations}
      backgroundImage={heroBackgrounds.academicBuildings}
      stats={formattedStats}
      loading={loading}
    />
  );
};
