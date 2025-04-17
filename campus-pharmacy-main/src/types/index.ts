export interface Medication {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  available: boolean;
  image: string;
  pharmacies: string[];
}

export interface Pharmacy {
  id: string;
  name: string;
  location: string;
  hours: string;
  phone: string;
  available: boolean;
  image: string;
}

export interface SearchResult {
  pharmacy: Pharmacy;
  medicines: Medication[];
}