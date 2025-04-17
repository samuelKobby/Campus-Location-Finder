-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS medicines CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS pharmacies CASCADE;

-- Create Pharmacies table first (no dependencies)
CREATE TABLE IF NOT EXISTS pharmacies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    hours TEXT NOT NULL,
    phone TEXT NOT NULL,
    available BOOLEAN DEFAULT true,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create Users table (no dependencies)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create Medicines table (depends on pharmacies)
CREATE TABLE IF NOT EXISTS medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    unit TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    available BOOLEAN DEFAULT true,
    image TEXT,
    pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create Inventory table (depends on medicines)
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medicine_id UUID REFERENCES medicines(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    batch_number TEXT,
    expiry_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    -- Drop policies for users table
    IF EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view their own data'
    ) THEN
        DROP POLICY "Users can view their own data" ON users;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Admin can view all users'
    ) THEN
        DROP POLICY "Admin can view all users" ON users;
    END IF;

    -- Drop policies for medicines table
    IF EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'medicines' AND policyname = 'Everyone can view medicines'
    ) THEN
        DROP POLICY "Everyone can view medicines" ON medicines;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'medicines' AND policyname = 'Admin can modify medicines'
    ) THEN
        DROP POLICY "Admin can modify medicines" ON medicines;
    END IF;

    -- Drop policies for inventory table
    IF EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'inventory' AND policyname = 'Staff and admin can view inventory'
    ) THEN
        DROP POLICY "Staff and admin can view inventory" ON inventory;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'inventory' AND policyname = 'Admin can modify inventory'
    ) THEN
        DROP POLICY "Admin can modify inventory" ON inventory;
    END IF;

    -- Drop policies for pharmacies table
    IF EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'pharmacies' AND policyname = 'Pharmacies are viewable by everyone'
    ) THEN
        DROP POLICY "Pharmacies are viewable by everyone" ON pharmacies;
    END IF;
END $$;

-- Create policies
CREATE POLICY "Pharmacies are viewable by everyone" ON pharmacies
    FOR SELECT USING (true);

CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admin can view all users" ON users
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Everyone can view medicines" ON medicines
    FOR SELECT USING (true);

CREATE POLICY "Admin can modify medicines" ON medicines
    FOR ALL USING (auth.role() = 'admin');

CREATE POLICY "Staff and admin can view inventory" ON inventory
    FOR SELECT USING (auth.role() IN ('admin', 'staff'));

CREATE POLICY "Admin can modify inventory" ON inventory
    FOR ALL USING (auth.role() = 'admin');

-- Create indexes for better performance
DROP INDEX IF EXISTS idx_medicines_name;
DROP INDEX IF EXISTS idx_inventory_medicine_id;
DROP INDEX IF EXISTS idx_medicines_pharmacy_id;

CREATE INDEX idx_medicines_name ON medicines(name);
CREATE INDEX idx_inventory_medicine_id ON inventory(medicine_id);
CREATE INDEX idx_medicines_pharmacy_id ON medicines(pharmacy_id);

-- Clear existing data
TRUNCATE TABLE pharmacies CASCADE;

-- Insert sample data
INSERT INTO pharmacies (id, name, location, hours, phone, available, image) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Legon Hall Pharmacy', 'Legon Hall', '8:00 AM - 9:00 PM', '020-555-0101', true, 'https://images.unsplash.com/photo-1576671081837-49000212a370?auto=format&fit=crop&q=80&w=500'),
    ('22222222-2222-2222-2222-222222222222', 'Akuafo Health Center Pharmacy', 'Akuafo Hall', '24/7', '020-555-0102', true, 'https://images.unsplash.com/photo-1586015555751-63c03a1cd28e?auto=format&fit=crop&q=80&w=500'),
    ('33333333-3333-3333-3333-333333333333', 'Commonwealth Pharmacy', 'Commonwealth Hall', '7:00 AM - 10:00 PM', '020-555-0103', true, 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80&w=500'),
    ('44444444-4444-4444-4444-444444444444', 'Volta Medical Store', 'Volta Hall', '8:00 AM - 8:00 PM', '020-555-0104', true, 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500'),
    ('55555555-5555-5555-5555-555555555555', 'Pentagon Pharmacy Plus', 'Pentagon Hostel', '8:00 AM - 11:00 PM', '020-555-0105', true, 'https://images.unsplash.com/photo-1576670159805-381a0b220be7?auto=format&fit=crop&q=80&w=500'),
    ('66666666-6666-6666-6666-666666666666', 'TF Health Hub', 'TF Hostel', '9:00 AM - 9:00 PM', '020-555-0106', true, 'https://images.unsplash.com/photo-1576670160185-16c5fd3c3ab8?auto=format&fit=crop&q=80&w=500'),
    ('77777777-7777-7777-7777-777777777777', 'Bani Pharmacy Care', 'Bani Hostel', '8:00 AM - 10:00 PM', '020-555-0107', true, 'https://images.unsplash.com/photo-1576670161844-d71c8b9504e4?auto=format&fit=crop&q=80&w=500');

-- Insert sample medicines
INSERT INTO medicines (name, description, category, unit, price, available, image, pharmacy_id) VALUES
    -- Legon Hall Pharmacy Medicines
    ('Paracetamol Extra', 'Strong pain relief', 'Pain Relief', 'tablet', 5.00, true, 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=500', '11111111-1111-1111-1111-111111111111'),
    ('Vitamin C Complex', 'Immunity booster', 'Supplements', 'tablet', 12.00, true, 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=500', '11111111-1111-1111-1111-111111111111'),
    ('Omega-3 Fish Oil', 'Heart health supplement', 'Supplements', 'capsule', 25.00, true, 'https://images.unsplash.com/photo-1577174881658-0f30ed549adc?auto=format&fit=crop&q=80&w=500', '11111111-1111-1111-1111-111111111111'),
    ('Zinc Tablets', 'Mineral supplement', 'Supplements', 'tablet', 8.00, true, 'https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&q=80&w=500', '11111111-1111-1111-1111-111111111111'),
    ('Magnesium Plus', 'Mineral supplement', 'Supplements', 'tablet', 15.00, true, 'https://images.unsplash.com/photo-1550572017-37c5b4c1b9f0?auto=format&fit=crop&q=80&w=500', '11111111-1111-1111-1111-111111111111'),

    -- Akuafo Health Center Pharmacy Medicines
    ('Ibuprofen Plus', 'Anti-inflammatory', 'Pain Relief', 'tablet', 6.00, true, 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=500', '22222222-2222-2222-2222-222222222222'),
    ('Cold Relief Max', 'Cold & flu relief', 'Cold & Flu', 'tablet', 10.00, true, 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&q=80&w=500', '22222222-2222-2222-2222-222222222222'),
    ('Allergy Relief', 'Antihistamine', 'Allergies', 'tablet', 12.00, true, 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500', '22222222-2222-2222-2222-222222222222'),
    ('First Aid Spray', 'Antiseptic spray', 'First Aid', 'spray', 15.00, true, 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=500', '22222222-2222-2222-2222-222222222222'),
    ('Bandage Pack', 'Sterile bandages', 'First Aid', 'pack', 8.00, true, 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?auto=format&fit=crop&q=80&w=500', '22222222-2222-2222-2222-222222222222'),

    -- Commonwealth Pharmacy Medicines
    ('Aspirin Extra', 'Pain relief', 'Pain Relief', 'tablet', 4.00, true, 'https://images.unsplash.com/photo-1626716493137-b67fe9501e76?auto=format&fit=crop&q=80&w=500', '33333333-3333-3333-3333-333333333333'),
    ('Multivitamin Complete', 'Daily vitamins', 'Supplements', 'tablet', 20.00, true, 'https://images.unsplash.com/photo-1577174881658-0f30ed549adc?auto=format&fit=crop&q=80&w=500', '33333333-3333-3333-3333-333333333333'),
    ('Iron Plus', 'Iron supplement', 'Supplements', 'tablet', 12.00, true, 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=500', '33333333-3333-3333-3333-333333333333'),
    ('Calcium Strong', 'Calcium supplement', 'Supplements', 'tablet', 15.00, true, 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=500', '33333333-3333-3333-3333-333333333333'),
    ('B-Complex', 'Vitamin B complex', 'Supplements', 'tablet', 18.00, true, 'https://images.unsplash.com/photo-1550572017-37c5b4c1b9f0?auto=format&fit=crop&q=80&w=500', '33333333-3333-3333-3333-333333333333'),

    -- Volta Medical Store Medicines
    ('Pain Relief Gel', 'Topical pain relief', 'Pain Relief', 'tube', 12.00, true, 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=500', '44444444-4444-4444-4444-444444444444'),
    ('Cough Syrup Plus', 'Cough relief', 'Cold & Flu', 'bottle', 15.00, true, 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&q=80&w=500', '44444444-4444-4444-4444-444444444444'),
    ('Sinus Relief', 'Nasal decongestant', 'Cold & Flu', 'spray', 10.00, true, 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500', '44444444-4444-4444-4444-444444444444'),
    ('Eye Drops', 'For dry eyes', 'Eye Care', 'drops', 8.00, true, 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=500', '44444444-4444-4444-4444-444444444444'),
    ('Throat Lozenges', 'Sore throat relief', 'Cold & Flu', 'pack', 5.00, true, 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?auto=format&fit=crop&q=80&w=500', '44444444-4444-4444-4444-444444444444'),

    -- Pentagon Pharmacy Plus Medicines
    ('Digestive Aid', 'Digestive supplement', 'Digestive Health', 'tablet', 14.00, true, 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=500', '55555555-5555-5555-5555-555555555555'),
    ('Probiotic Plus', 'Gut health', 'Digestive Health', 'capsule', 25.00, true, 'https://images.unsplash.com/photo-1577174881658-0f30ed549adc?auto=format&fit=crop&q=80&w=500', '55555555-5555-5555-5555-555555555555'),
    ('Sleep Aid', 'Natural sleep support', 'Sleep & Stress', 'tablet', 18.00, true, 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=500', '55555555-5555-5555-5555-555555555555'),
    ('Stress Relief', 'Anxiety support', 'Sleep & Stress', 'tablet', 20.00, true, 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=500', '55555555-5555-5555-5555-555555555555'),
    ('Energy Boost', 'Natural energizer', 'Supplements', 'tablet', 16.00, true, 'https://images.unsplash.com/photo-1550572017-37c5b4c1b9f0?auto=format&fit=crop&q=80&w=500', '55555555-5555-5555-5555-555555555555'),

    -- TF Health Hub Medicines
    ('Joint Care Plus', 'Joint supplement', 'Pain Relief', 'tablet', 22.00, true, 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=500', '66666666-6666-6666-6666-666666666666'),
    ('Muscle Rub', 'Muscle pain relief', 'Pain Relief', 'cream', 15.00, true, 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&q=80&w=500', '66666666-6666-6666-6666-666666666666'),
    ('Immune Support', 'Immunity booster', 'Supplements', 'tablet', 20.00, true, 'https://images.unsplash.com/photo-1577174881658-0f30ed549adc?auto=format&fit=crop&q=80&w=500', '66666666-6666-6666-6666-666666666666'),
    ('Antacid Plus', 'Heartburn relief', 'Digestive Health', 'tablet', 8.00, true, 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=500', '66666666-6666-6666-6666-666666666666'),
    ('Electrolyte Powder', 'Hydration support', 'Supplements', 'sachet', 12.00, true, 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?auto=format&fit=crop&q=80&w=500', '66666666-6666-6666-6666-666666666666'),

    -- Bani Pharmacy Care Medicines
    ('Wound Healing Cream', 'Advanced wound care', 'First Aid', 'cream', 18.00, true, 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=500', '77777777-7777-7777-7777-777777777777'),
    ('Blood Pressure Support', 'BP management', 'Heart Health', 'tablet', 25.00, true, 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=500', '77777777-7777-7777-7777-777777777777'),
    ('Diabetes Support', 'Blood sugar management', 'Diabetes Care', 'tablet', 28.00, true, 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=500', '77777777-7777-7777-7777-777777777777'),
    ('Liver Support', 'Liver health', 'Supplements', 'tablet', 22.00, true, 'https://images.unsplash.com/photo-1577174881658-0f30ed549adc?auto=format&fit=crop&q=80&w=500', '77777777-7777-7777-7777-777777777777'),
    ('Memory Boost', 'Cognitive support', 'Brain Health', 'capsule', 30.00, true, 'https://images.unsplash.com/photo-1550572017-37c5b4c1b9f0?auto=format&fit=crop&q=80&w=500', '77777777-7777-7777-7777-777777777777');
