export interface Pharmacy {
  id: string;
  name: string;
  location: string;
  phone: string;
  email: string | null;
  description: string | null;
  image_url: string | null;
  open_hours: string;
  hours: string;
  latitude: number;
  longitude: number;
  available?: boolean;
  created_at: string;
  updated_at: string;
}

export type PharmacyStatus = 'active' | 'approved' | 'suspended' | 'pending';

export interface ActivityLog {
  id: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, any>;
  created_at: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  location: string;
  hours: string;
  phone: string;
  available: boolean;
  image: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
}

export interface AcademicBuilding extends Location {
  departments: string[];
  facilities: string[];
}

export interface Library extends Location {
  study_spaces: number;
  has_computers: boolean;
  has_printers: boolean;
}

export interface DiningHall extends Location {
  cuisine_types: string[];
  meal_plans_accepted: boolean;
  capacity: number;
}

export interface SportsFacility extends Location {
  sports_types: string[];
  equipment_available: boolean;
  indoor: boolean;
}

export interface StudentCenter extends Location {
  amenities: string[];
  has_food_court: boolean;
  has_study_space: boolean;
}

export interface HealthService extends Location {
  services: string[];
  emergency_available: boolean;
  appointment_required: boolean;
}
