// Pharmacy data
export const pharmacies = [
  {
    id: '1',
    name: 'Legon Hall Pharmacy',
    location: 'Legon Hall',
    hours: '8:00 AM - 9:00 PM',
    phone: '020-555-0101',
    email: 'legon.pharmacy@campus.edu',
    description: 'Located in the heart of Legon Hall, we provide comprehensive pharmaceutical services to students and staff. Our experienced team ensures quick and reliable service with a wide range of medicines and healthcare products.',
    available: true,
    image: 'https://images.unsplash.com/photo-1576671081837-49000212a370?auto=format&fit=crop&q=80&w=500'
  },
  {
    id: '2',
    name: 'Akuafo Hall Pharmacy',
    location: 'Akuafo Hall',
    hours: '9:00 AM - 8:00 PM',
    phone: '020-555-0102',
    email: 'akuafo.pharmacy@campus.edu',
    description: 'Your trusted pharmacy at Akuafo Hall. We specialize in providing essential medications and healthcare products with professional consultation services. Our priority is your health and well-being.',
    available: true,
    image: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&q=80&w=500'
  },
  {
    id: '3',
    name: 'Volta Hall Pharmacy',
    location: 'Volta Hall',
    hours: '8:30 AM - 8:30 PM',
    phone: '020-555-0103',
    email: 'volta.pharmacy@campus.edu',
    description: 'Serving the Volta Hall community with dedication and care. Our pharmacy offers a wide selection of medicines, health supplies, and professional pharmaceutical services. We are committed to providing excellent healthcare support.',
    available: true,
    image: 'https://images.unsplash.com/photo-1576671081837-49000212a370?auto=format&fit=crop&q=80&w=500'
  }
];

// Medicine data with pharmacy associations
export const medicines = [
  {
    id: '1',
    name: 'Paracetamol',
    description: 'For fever and mild pain relief',
    category: 'Pain Relief',
    price: 5.00,
    unit: 'tablet',
    available: true,
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=500',
    pharmacies: ['1', '2']
  },
  {
    id: '2',
    name: 'Ibuprofen',
    description: 'Anti-inflammatory pain relief',
    category: 'Pain Relief',
    price: 8.00,
    unit: 'tablet',
    available: true,
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=500',
    pharmacies: ['1', '3']
  },
  {
    id: '3',
    name: 'Cold Relief Plus',
    description: 'Multi-symptom cold relief',
    category: 'Cold & Flu',
    price: 12.00,
    unit: 'tablet',
    available: true,
    image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&q=80&w=500',
    pharmacies: ['2']
  },
  {
    id: '4',
    name: 'Cough Syrup',
    description: 'For dry and wet cough',
    category: 'Cold & Flu',
    price: 15.00,
    unit: 'bottle',
    available: true,
    image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=500',
    pharmacies: ['1', '2', '3']
  },
  {
    id: '5',
    name: 'Antihistamine',
    description: 'For allergies and hay fever',
    category: 'Allergies',
    price: 10.00,
    unit: 'tablet',
    available: true,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500',
    pharmacies: ['2', '3']
  },
  {
    id: '6',
    name: 'Amoxicillin',
    description: 'Antibiotic for bacterial infections',
    category: 'Antibiotics',
    price: 15.00,
    unit: 'capsule',
    available: true,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500',
    pharmacies: ['1', '2']
  },
  {
    id: '7',
    name: 'Omeprazole',
    description: 'For acid reflux and heartburn',
    category: 'Digestive Health',
    price: 20.00,
    unit: 'tablet',
    available: true,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500',
    pharmacies: ['2', '3']
  },
  {
    id: '8',
    name: 'Vitamin D3',
    description: 'Supports bone health and immunity',
    category: 'Vitamins',
    price: 12.00,
    unit: 'tablet',
    available: true,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500',
    pharmacies: ['1', '2', '3']
  },
  {
    id: '9',
    name: 'Metformin',
    description: 'For type 2 diabetes management',
    category: 'Diabetes',
    price: 18.00,
    unit: 'tablet',
    available: true,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500',
    pharmacies: ['1', '3']
  },
  {
    id: '10',
    name: 'Aspirin',
    description: 'Pain relief and blood thinner',
    category: 'Pain Relief',
    price: 6.00,
    unit: 'tablet',
    available: true,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500',
    pharmacies: ['1', '2', '3']
  },
  {
    id: '11',
    name: 'Cetirizine',
    description: 'For allergies and hives',
    category: 'Allergies',
    price: 8.00,
    unit: 'tablet',
    available: true,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500',
    pharmacies: ['2']
  },
  {
    id: '12',
    name: 'Zinc Supplements',
    description: 'Supports immune system',
    category: 'Vitamins',
    price: 10.00,
    unit: 'tablet',
    available: true,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500',
    pharmacies: ['1', '2']
  },
  {
    id: '13',
    name: 'Metronidazole',
    description: 'Antibiotic for various infections',
    category: 'Antibiotics',
    price: 16.00,
    unit: 'tablet',
    available: true,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500',
    pharmacies: ['3']
  },
  {
    id: '14',
    name: 'Loratadine',
    description: 'Non-drowsy allergy relief',
    category: 'Allergies',
    price: 9.00,
    unit: 'tablet',
    available: true,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500',
    pharmacies: ['1', '2', '3']
  },
  {
    id: '15',
    name: 'Multivitamin Complex',
    description: 'Daily essential vitamins and minerals',
    category: 'Vitamins',
    price: 22.00,
    unit: 'tablet',
    available: true,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500',
    pharmacies: ['2', '3']
  },
  {
    id: '16',
    name: 'Diclofenac Gel',
    description: 'Topical pain relief',
    category: 'Pain Relief',
    price: 14.00,
    unit: 'tube',
    available: true,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500',
    pharmacies: ['1', '3']
  },
  {
    id: '17',
    name: 'Ciprofloxacin',
    description: 'Broad-spectrum antibiotic',
    category: 'Antibiotics',
    price: 25.00,
    unit: 'tablet',
    available: true,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500',
    pharmacies: ['2']
  },
  {
    id: '18',
    name: 'Ranitidine',
    description: 'For acid reflux and ulcers',
    category: 'Digestive Health',
    price: 13.00,
    unit: 'tablet',
    available: true,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500',
    pharmacies: ['1', '2', '3']
  },
  {
    id: '19',
    name: 'Iron Supplements',
    description: 'For iron deficiency and anemia',
    category: 'Vitamins',
    price: 11.00,
    unit: 'tablet',
    available: true,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500',
    pharmacies: ['2', '3']
  },
  {
    id: '20',
    name: 'Hydrocortisone Cream',
    description: 'For skin irritation and itching',
    category: 'Skin Care',
    price: 9.00,
    unit: 'tube',
    available: true,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500',
    pharmacies: ['1', '2']
  },
  {
    id: '21',
    name: 'Calcium + Vitamin D',
    description: 'For bone health',
    category: 'Vitamins',
    price: 16.00,
    unit: 'tablet',
    available: true,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500',
    pharmacies: ['1', '3']
  },
  {
    id: '22',
    name: 'Loperamide',
    description: 'For diarrhea relief',
    category: 'Digestive Health',
    price: 7.00,
    unit: 'capsule',
    available: true,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500',
    pharmacies: ['1', '2', '3']
  },
  {
    id: '23',
    name: 'Vitamin B Complex',
    description: 'Essential B vitamins for energy',
    category: 'Vitamins',
    price: 14.00,
    unit: 'tablet',
    available: true,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500',
    pharmacies: ['2']
  },
  {
    id: '24',
    name: 'Azithromycin',
    description: 'Antibiotic for respiratory infections',
    category: 'Antibiotics',
    price: 28.00,
    unit: 'tablet',
    available: true,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500',
    pharmacies: ['1', '2', '3']
  },
  {
    id: '25',
    name: 'Folic Acid',
    description: 'Important for cell growth and DNA synthesis',
    category: 'Vitamins',
    price: 8.00,
    unit: 'tablet',
    available: true,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500',
    pharmacies: ['1', '2']
  }
];
