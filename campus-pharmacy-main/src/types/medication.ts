export interface Medication {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  availability: boolean;
}

export type MedicationCategory = {
  id: string;
  title: string;
  description: string;
};