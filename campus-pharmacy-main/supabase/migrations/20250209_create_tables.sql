-- Create storage bucket for pharmacy images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pharmacy-images', 'pharmacy-images', true);

-- Create storage policy to allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'pharmacy-images'
);

-- Create storage policy to allow public to view images
CREATE POLICY "Allow public to view images"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'pharmacy-images');

-- Create storage bucket for medicine images if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('medicine-images', 'medicine-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload medicine images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'medicine-images');

-- Create policy to allow public to view images
CREATE POLICY "Allow public to view medicine images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'medicine-images');

-- Create pharmacies table
CREATE TABLE IF NOT EXISTS pharmacies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    description TEXT,
    image_url TEXT,
    operating_hours JSONB,
    coordinates JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create medicines table
CREATE TABLE IF NOT EXISTS medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on pharmacy_id and created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_pharmacy_created 
ON notifications(pharmacy_id, created_at DESC);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Pharmacist', 'Staff')),
    last_sign_in_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Update pharmacies table to set default values for coordinates
ALTER TABLE pharmacies 
    ADD COLUMN latitude DECIMAL(10, 8) DEFAULT 0,
    ADD COLUMN longitude DECIMAL(11, 8) DEFAULT 0;

-- Create RLS policies for pharmacies
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to read pharmacies"
    ON pharmacies FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow admin users to modify pharmacies"
    ON pharmacies FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.role = 'Admin'
        )
    );

-- Create RLS policies for medicines
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to read medicines"
    ON medicines FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow authenticated users to modify medicines"
    ON medicines FOR ALL
    TO authenticated
    USING (true);

-- Create medicine_pharmacies table if it doesn't exist
CREATE TABLE IF NOT EXISTS medicine_pharmacies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(medicine_id, pharmacy_id)
);

-- Drop the old medicine_pharmacy table
DROP TABLE IF EXISTS medicine_pharmacy;

-- Create RLS policies for medicine_pharmacies
ALTER TABLE medicine_pharmacies ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to perform all operations (temporary for debugging)
CREATE POLICY "Allow authenticated users full access"
    ON medicine_pharmacies FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create RLS policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read notifications"
    ON notifications FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow admin users to create notifications"
    ON notifications FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.role = 'Admin'
        )
    );

CREATE POLICY "Allow admin users to update notifications"
    ON notifications FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.role = 'Admin'
        )
    );

-- Create RLS policies for admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read admin_users"
    ON admin_users FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow admin users to modify admin_users"
    ON admin_users FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.role = 'Admin'
        )
    );

-- Create functions and triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_medicines_updated_at ON medicines;
CREATE TRIGGER update_medicines_updated_at
    BEFORE UPDATE ON medicines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pharmacies_updated_at ON pharmacies;
CREATE TRIGGER update_pharmacies_updated_at
    BEFORE UPDATE ON pharmacies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_medicine_pharmacies_updated_at ON medicine_pharmacies;
CREATE TRIGGER update_medicine_pharmacies_updated_at
    BEFORE UPDATE ON medicine_pharmacies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
