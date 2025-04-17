-- Create pharmacies table
CREATE TABLE pharmacies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    hours TEXT NOT NULL,
    phone TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    available BOOLEAN DEFAULT true,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create medicines table
CREATE TABLE medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    unit TEXT NOT NULL,
    available BOOLEAN DEFAULT true,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create junction table for medicines and pharmacies
CREATE TABLE medicine_pharmacies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medicine_id UUID REFERENCES medicines(id) ON DELETE CASCADE,
    pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(medicine_id, pharmacy_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_medicines_category ON medicines(category);
CREATE INDEX idx_medicine_pharmacies_medicine_id ON medicine_pharmacies(medicine_id);
CREATE INDEX idx_medicine_pharmacies_pharmacy_id ON medicine_pharmacies(pharmacy_id);

-- Insert sample pharmacies
INSERT INTO pharmacies (name, location, hours, phone, latitude, longitude, available, image) VALUES
    ('Legon Hall Pharmacy', 'Legon Hall', '8:00 AM - 9:00 PM', '020-555-0101', 5.6505, -0.1862, true, 'https://images.unsplash.com/photo-1576671081837-49000212a370?auto=format&fit=crop&q=80&w=500'),
    ('Akuafo Hall Pharmacy', 'Akuafo Hall', '9:00 AM - 8:00 PM', '020-555-0102', 5.6515, -0.1872, true, 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&q=80&w=500'),
    ('Volta Hall Pharmacy', 'Volta Hall', '8:30 AM - 8:30 PM', '020-555-0103', 5.6525, -0.1882, true, 'https://images.unsplash.com/photo-1576671081837-49000212a370?auto=format&fit=crop&q=80&w=500'),
    ('Commonwealth Hall Pharmacy', 'Commonwealth Hall', '8:00 AM - 10:00 PM', '020-555-0104', 5.6498, -0.1868, true, 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&q=80&w=500'),
    ('Night & Day Pharmacy', 'Central Cafeteria', '24 Hours', '020-555-0105', 5.6512, -0.1875, true, 'https://images.unsplash.com/photo-1576671081837-49000212a370?auto=format&fit=crop&q=80&w=500'),
    ('JQB Pharmacy', 'JQB Building', '7:00 AM - 9:00 PM', '020-555-0106', 5.6508, -0.1857, true, 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500'),
    ('Business School Pharmacy', 'Business School', '8:00 AM - 8:00 PM', '020-555-0107', 5.6535, -0.1865, true, 'https://images.unsplash.com/photo-1576671081837-49000212a370?auto=format&fit=crop&q=80&w=500'),
    ('Pentagon Pharmacy', 'Pentagon Block', '9:00 AM - 7:00 PM', '020-555-0108', 5.6518, -0.1882, true, 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&q=80&w=500'),
    ('ISH Pharmacy', 'International Students Hostel', '8:30 AM - 9:30 PM', '020-555-0109', 5.6528, -0.1870, true, 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500'),
    ('Balme Library Pharmacy', 'Balme Library', '9:00 AM - 6:00 PM', '020-555-0110', 5.6502, -0.1878, true, 'https://images.unsplash.com/photo-1576671081837-49000212a370?auto=format&fit=crop&q=80&w=500');

-- Insert sample medicines
INSERT INTO medicines (name, description, category, price, unit, available, image) VALUES
    ('Paracetamol', 'For fever and mild pain relief', 'Pain Relief', 5.00, 'tablet', true, 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=500'),
    ('Ibuprofen', 'Anti-inflammatory pain relief', 'Pain Relief', 8.00, 'tablet', true, 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=500'),
    ('Cold Relief Plus', 'Multi-symptom cold relief', 'Cold & Flu', 12.00, 'tablet', true, 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&q=80&w=500'),
    ('Amoxicillin', 'Antibiotic for bacterial infections', 'Antibiotics', 15.00, 'capsule', true, 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=500'),
    ('Cetirizine', 'Antihistamine for allergies', 'Allergy', 7.50, 'tablet', true, 'https://images.unsplash.com/photo-1626716493137-b67fe9501e76?auto=format&fit=crop&q=80&w=500'),
    ('Omeprazole', 'For acid reflux and heartburn', 'Digestive Health', 10.00, 'capsule', true, 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=500'),
    ('Vitamin C', 'Immune system support', 'Vitamins', 6.00, 'tablet', true, 'https://images.unsplash.com/photo-1589386417686-0d34b5903d23?auto=format&fit=crop&q=80&w=500'),
    ('Aspirin', 'Pain relief and blood thinner', 'Pain Relief', 4.50, 'tablet', true, 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=500');

-- Link medicines to pharmacies
WITH medicine_ids AS (
  SELECT id, name FROM medicines
),
pharmacy_ids AS (
  SELECT id, name FROM pharmacies
)
INSERT INTO medicine_pharmacies (medicine_id, pharmacy_id)
SELECT m.id, p.id
FROM medicine_ids m
CROSS JOIN pharmacy_ids p
WHERE 
  -- Common medicines available at all pharmacies
  m.name IN ('Paracetamol', 'Vitamin C', 'Aspirin')
  OR
  -- Specific pharmacy distributions
  (m.name = 'Ibuprofen' AND p.name IN ('Legon Hall Pharmacy', 'Akuafo Hall Pharmacy', 'Commonwealth Hall Pharmacy', 'Night & Day Pharmacy', 'Business School Pharmacy'))
  OR
  (m.name = 'Cold Relief Plus' AND p.name IN ('Volta Hall Pharmacy', 'Legon Hall Pharmacy', 'Night & Day Pharmacy', 'Pentagon Pharmacy', 'ISH Pharmacy'))
  OR
  (m.name = 'Amoxicillin' AND p.name IN ('Legon Hall Pharmacy', 'Volta Hall Pharmacy', 'JQB Pharmacy', 'Night & Day Pharmacy', 'Balme Library Pharmacy'))
  OR
  (m.name = 'Cetirizine' AND p.name IN ('Akuafo Hall Pharmacy', 'Volta Hall Pharmacy', 'Commonwealth Hall Pharmacy', 'Pentagon Pharmacy', 'ISH Pharmacy'))
  OR
  (m.name = 'Omeprazole' AND p.name IN ('Legon Hall Pharmacy', 'Night & Day Pharmacy', 'Business School Pharmacy', 'Balme Library Pharmacy'));

-- Create RLS policies
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_pharmacies ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on pharmacies" ON pharmacies
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access on medicines" ON medicines
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access on medicine_pharmacies" ON medicine_pharmacies
    FOR SELECT USING (true);

-- Create admin_users table
CREATE TABLE admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('editor', 'admin', 'super_admin')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activity_logs table
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES admin_users(id),
    action_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin_settings table
CREATE TABLE admin_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_settings JSONB NOT NULL DEFAULT '{
        "email_notifications": true,
        "low_stock_alerts": true,
        "new_pharmacy_alerts": true
    }'::jsonb,
    security_settings JSONB NOT NULL DEFAULT '{
        "two_factor_auth": false,
        "session_timeout": 30,
        "password_expiry_days": 90
    }'::jsonb,
    system_settings JSONB NOT NULL DEFAULT '{
        "maintenance_mode": false,
        "debug_mode": false,
        "cache_duration": 3600
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('system', 'alert', 'info')),
    recipient_type TEXT NOT NULL CHECK (recipient_type IN ('all', 'pharmacy', 'admin')),
    recipient_id UUID REFERENCES pharmacies(id),
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies for admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view all admin users"
    ON admin_users FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
        )
    );

CREATE POLICY "Super admins can insert admin users"
    ON admin_users FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.role = 'super_admin'
        )
    );

CREATE POLICY "Super admins can update admin users"
    ON admin_users FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.role = 'super_admin'
        )
    );

CREATE POLICY "Super admins can delete admin users"
    ON admin_users FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.role = 'super_admin'
        )
    );

-- Create RLS policies for activity_logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view all activity logs"
    ON activity_logs FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
        )
    );

CREATE POLICY "Admin users can insert activity logs"
    ON activity_logs FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
        )
    );

-- Create RLS policies for admin_settings
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view settings"
    ON admin_settings FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
        )
    );

CREATE POLICY "Super admins can update settings"
    ON admin_settings FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.role = 'super_admin'
        )
    );

-- Create RLS policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view all notifications"
    ON notifications FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
        )
    );

CREATE POLICY "Admin users can create notifications"
    ON notifications FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
        )
    );

CREATE POLICY "Admin users can update notifications"
    ON notifications FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
        )
    );

CREATE POLICY "Admin users can delete notifications"
    ON notifications FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
        )
    );

-- Function to create the first super admin
CREATE OR REPLACE FUNCTION create_super_admin(
    admin_email TEXT,
    admin_password TEXT,
    admin_full_name TEXT
) RETURNS UUID AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Create the user in auth.users
    user_id := (
        SELECT id FROM auth.users
        WHERE email = admin_email
        LIMIT 1
    );
    
    IF user_id IS NULL THEN
        user_id := (
            SELECT id FROM auth.users
            WHERE auth.create_user(
                admin_email,
                admin_password,
                '{}'::jsonb
            ) RETURNING id
        );
    END IF;

    -- Insert into admin_users
    INSERT INTO admin_users (id, email, full_name, role)
    VALUES (user_id, admin_email, admin_full_name, 'super_admin')
    ON CONFLICT (id) DO NOTHING;

    RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
