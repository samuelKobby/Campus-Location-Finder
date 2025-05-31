import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useLocations } from '../context/LocationContext';
import { toast } from 'react-hot-toast';

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
  latitude: number | null;
  longitude: number | null;
}

export const LocationLoader = () => {
  const {
    setAcademicLocations,
    setDiningLocations,
    setHealthLocations,
    setLibraryLocations,
    setSportsLocations,
    setStudentCenterLocations
  } = useLocations();

  const formatOpeningHours = (hours: OpeningHours | string | null): string => {
    if (!hours) return '7:00 AM - 10:00 PM';
    if (typeof hours === 'string') return hours;
    
    if (hours.open && hours.close) {
      return `${hours.open} - ${hours.close}`;
    }
    
    return '7:00 AM - 10:00 PM';
  };

  const getDirectionsUrl = (latitude: number, longitude: number) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  };

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .order('name');

        if (error) throw error;

        if (data) {
          const locations = data as DatabaseLocation[];
          
          // Group locations by building type
          const academicLocs = locations.filter(loc => loc.building_type === 'academic').map(loc => ({
            id: loc.id,
            name: loc.name,
            description: loc.description || 'Academic building housing classrooms and faculty offices.',
            building: loc.name,
            openingHours: formatOpeningHours(loc.opening_hours),
            image: loc.image_url || '/images/academic.jpg',
            tags: ['Classrooms', 'Offices', 'Study Areas'],
            getDirections: loc.latitude && loc.longitude ? () => {
              window.open(getDirectionsUrl(loc.latitude!, loc.longitude!), '_blank');
            } : undefined
          }));

          const diningLocs = locations.filter(loc => loc.building_type === 'dining').map(loc => ({
            id: loc.id,
            name: loc.name,
            description: loc.description || 'Campus dining location offering fresh, delicious meals.',
            building: loc.name,
            openingHours: formatOpeningHours(loc.opening_hours),
            image: loc.image_url || '/images/dining.jpg',
            tags: ['Dining', 'Cafeteria', 'Food Court'],
            getDirections: loc.latitude && loc.longitude ? () => {
              window.open(getDirectionsUrl(loc.latitude!, loc.longitude!), '_blank');
            } : undefined
          }));

          const healthLocs = locations.filter(loc => loc.building_type === 'health').map(loc => ({
            id: loc.id,
            name: loc.name,
            description: loc.description || 'Health services providing medical care and support.',
            building: loc.name,
            openingHours: formatOpeningHours(loc.opening_hours),
            image: loc.image_url || '/images/health.jpg',
            tags: ['Medical', 'Health', 'Pharmacy'],
            getDirections: loc.latitude && loc.longitude ? () => {
              window.open(getDirectionsUrl(loc.latitude!, loc.longitude!), '_blank');
            } : undefined
          }));

          const libraryLocs = locations.filter(loc => loc.building_type === 'library').map(loc => ({
            id: loc.id,
            name: loc.name,
            description: loc.description || 'Library providing study spaces and resources.',
            building: loc.name,
            openingHours: formatOpeningHours(loc.opening_hours),
            image: loc.image_url || '/images/library.jpg',
            tags: ['Study', 'Books', 'Resources'],
            getDirections: loc.latitude && loc.longitude ? () => {
              window.open(getDirectionsUrl(loc.latitude!, loc.longitude!), '_blank');
            } : undefined
          }));

          const sportsLocs = locations.filter(loc => loc.building_type === 'sports').map(loc => ({
            id: loc.id,
            name: loc.name,
            description: loc.description || 'Sports facility for recreation and athletics.',
            building: loc.name,
            openingHours: formatOpeningHours(loc.opening_hours),
            image: loc.image_url || '/images/sports.jpg',
            tags: ['Sports', 'Recreation', 'Fitness'],
            getDirections: loc.latitude && loc.longitude ? () => {
              window.open(getDirectionsUrl(loc.latitude!, loc.longitude!), '_blank');
            } : undefined
          }));

          const studentCenterLocs = locations.filter(loc => loc.building_type === 'student-center').map(loc => ({
            id: loc.id,
            name: loc.name,
            description: loc.description || 'Student center for activities and services.',
            building: loc.name,
            openingHours: formatOpeningHours(loc.opening_hours),
            image: loc.image_url || '/images/student-center.jpg',
            tags: ['Student Life', 'Services', 'Activities'],
            getDirections: loc.latitude && loc.longitude ? () => {
              window.open(getDirectionsUrl(loc.latitude!, loc.longitude!), '_blank');
            } : undefined
          }));

          // Update context with all locations
          setAcademicLocations(academicLocs);
          setDiningLocations(diningLocs);
          setHealthLocations(healthLocs);
          setLibraryLocations(libraryLocs);
          setSportsLocations(sportsLocs);
          setStudentCenterLocations(studentCenterLocs);
        }
      } catch (error: any) {
        console.error('Error loading locations:', error);
        toast.error('Error loading locations');
      }
    };

    loadLocations();
  }, []);

  return null; // This component doesn't render anything
};
