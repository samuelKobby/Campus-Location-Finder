export type PharmacyStatus = 'active' | 'suspended' | 'pending';

export interface Pharmacy {
  id: string;
  name: string;
  location: string;
  contact: string;
  medications: string[]; // Array of medication IDs
  open_hours: string;
  status: PharmacyStatus;
  latitude: number;
  longitude: number;
  hours: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}