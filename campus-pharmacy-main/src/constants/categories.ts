import { Icons } from './icons';

export const MEDICATION_CATEGORIES = [
  {
    id: 'tablets',
    title: 'Tablets',
    icon: 'Pill' as const,
    description: 'Browse our selection of tablet medications',
  },
  {
    id: 'syrups',
    title: 'Syrups',
    icon: 'Beaker' as const,
    description: 'Liquid medications and syrups',
  },
  {
    id: 'topical',
    title: 'Topical',
    icon: 'Sparkles' as const,
    description: 'External use medications and creams',
  },
] as const;

export type CategoryId = typeof MEDICATION_CATEGORIES[number]['id'];