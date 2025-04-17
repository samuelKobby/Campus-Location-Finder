-- Create enum for building types
CREATE TYPE building_type AS ENUM (
  'academic',
  'library',
  'dining',
  'sports',
  'student_center',
  'clinic',
  'hospital'
);

-- Create locations table (base table for all locations)
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  contact_number VARCHAR(20),
  email VARCHAR(255),
  website_url VARCHAR(255),
  opening_hours JSONB,
  image_url TEXT,
  building_type building_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create academic buildings table
CREATE TABLE academic_buildings (
  id UUID PRIMARY KEY REFERENCES locations(id) ON DELETE CASCADE,
  department VARCHAR(255),
  faculty_count INTEGER,
  facilities JSONB, -- For storing facilities like 'lecture halls', 'labs', etc.
  accessibility_features TEXT[]
);

-- Create libraries table
CREATE TABLE libraries (
  id UUID PRIMARY KEY REFERENCES locations(id) ON DELETE CASCADE,
  total_capacity INTEGER,
  study_rooms_count INTEGER,
  computer_count INTEGER,
  special_collections TEXT[],
  services TEXT[]
);

-- Create dining halls table
CREATE TABLE dining_halls (
  id UUID PRIMARY KEY REFERENCES locations(id) ON DELETE CASCADE,
  cuisine_types TEXT[],
  seating_capacity INTEGER,
  meal_plans_accepted BOOLEAN DEFAULT true,
  dietary_options TEXT[],
  peak_hours JSONB
);

-- Create sports facilities table
CREATE TABLE sports_facilities (
  id UUID PRIMARY KEY REFERENCES locations(id) ON DELETE CASCADE,
  facility_types TEXT[],
  indoor_outdoor VARCHAR(20),
  equipment_available BOOLEAN,
  sports_offered TEXT[],
  reservation_required BOOLEAN DEFAULT false
);

-- Create student centers table
CREATE TABLE student_centers (
  id UUID PRIMARY KEY REFERENCES locations(id) ON DELETE CASCADE,
  amenities TEXT[],
  study_spaces BOOLEAN DEFAULT true,
  food_options TEXT[],
  event_spaces BOOLEAN DEFAULT false,
  student_organizations_count INTEGER
);

-- Create health services table
CREATE TABLE health_services (
  id UUID PRIMARY KEY REFERENCES locations(id) ON DELETE CASCADE,
  services TEXT[],
  specialties TEXT[],
  emergency_services BOOLEAN DEFAULT false,
  accessibility_features TEXT[],
  facility_type VARCHAR(20) NOT NULL CHECK (facility_type IN ('clinic', 'hospital')),
  bed_capacity INTEGER,
  operating_hours JSONB,
  insurance_accepted TEXT[]
);

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_locations_building_type ON locations(building_type);
CREATE INDEX idx_locations_name ON locations(name);
CREATE INDEX idx_health_services_facility_type ON health_services(facility_type);

-- Create RLS policies
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE dining_halls ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_services ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access" ON locations FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON academic_buildings FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON libraries FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON dining_halls FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON sports_facilities FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON student_centers FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON health_services FOR SELECT USING (true);

-- Create policies for admin write access
CREATE POLICY "Allow admin write access" ON locations 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admin write access" ON academic_buildings 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admin write access" ON libraries 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admin write access" ON dining_halls 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admin write access" ON sports_facilities 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admin write access" ON student_centers 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admin write access" ON health_services 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
