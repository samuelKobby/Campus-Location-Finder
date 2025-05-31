import React, { useState, useEffect } from 'react';
import { FaUsers } from 'react-icons/fa';
import { CategoryLayout } from '../../components/category/CategoryLayout';
import { heroBackgrounds } from '../../utils/imageUrls';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useLocations } from '../../context/LocationContext';

interface DatabaseStudentCenter {
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
  student_centers: {
    floor_count: number;
    study_spaces: number;
    meeting_rooms: number;
    facilities: string[];
    opening_hours: string;
  } | null;
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

export const StudentCenters = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    centers: 0,
    studySpaces: 0,
    meetingRooms: 0
  });
  const { setStudentCenterLocations } = useLocations();

  const getDirectionsUrl = (latitude: number, longitude: number) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`;
  };

  useEffect(() => {
    fetchStudentCenters();
  }, []);

  const fetchStudentCenters = async () => {
    try {
      setLoading(true);
      
      const { data: centerData, error } = await supabase
        .from('locations')
        .select(`
          *,
          student_centers(*)
        `)
        .eq('building_type', 'student_center')
        .order('name');

      if (error) throw error;

      if (centerData) {
        const formattedCenters: Location[] = (centerData as DatabaseStudentCenter[]).map(center => ({
          id: center.id,
          name: center.name,
          description: center.description || '',
          building: center.name,
          floor: `${center.student_centers?.floor_count || 1} Floor${center.student_centers?.floor_count !== 1 ? 's' : ''}`,
          openingHours: center.student_centers?.opening_hours || '7:00 AM - 11:00 PM',
          image: center.image_url || heroBackgrounds.studentCenters,
          tags: center.student_centers?.facilities || [],
          getDirections: center.latitude && center.longitude ? () => {
            const url = getDirectionsUrl(center.latitude, center.longitude);
            window.open(url, '_blank');
          } : undefined
        }));

        setLocations(formattedCenters);
        setStudentCenterLocations(formattedCenters); // Store in context

        // Calculate stats
        const totalStats = {
          centers: centerData.length,
          studySpaces: centerData.reduce((sum, center) => sum + (center.student_centers?.study_spaces || 0), 0),
          meetingRooms: centerData.reduce((sum, center) => sum + (center.student_centers?.meeting_rooms || 0), 0)
        };

        setStats(totalStats);
      }
    } catch (error: any) {
      toast.error(error.message);
      console.error('Error fetching student centers:', error);
    } finally {
      setLoading(false);
    }
  };

  const formattedStats = [
    {
      label: 'Centers',
      value: `${stats.centers}+`
    },
    {
      label: 'Study Spaces',
      value: `${stats.studySpaces}+`
    },
    {
      label: 'Meeting Rooms',
      value: `${stats.meetingRooms}+`
    }
  ];

  return (
    <CategoryLayout
      title="Student Centers"
      description="Discover vibrant community spaces designed for student activities, collaboration, and relaxation."
      icon={FaUsers}
      locations={locations}
      backgroundImage={heroBackgrounds.studentCenters}
      stats={formattedStats}
      loading={loading}
    />
  );
};
