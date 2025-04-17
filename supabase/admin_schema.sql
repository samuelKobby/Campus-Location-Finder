-- Create admin users table
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin')),
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create activity logs table
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES admin_users(id),
    action_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create pharmacy requests table
CREATE TABLE pharmacy_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pharmacy_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    location TEXT NOT NULL,
    license_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    documents JSONB,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create medicine categories table
CREATE TABLE medicine_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add category_id to medicines table
ALTER TABLE medicines ADD COLUMN category_id UUID REFERENCES medicine_categories(id);

-- Create medicine inventory logs
CREATE TABLE inventory_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medicine_id UUID REFERENCES medicines(id),
    pharmacy_id UUID REFERENCES pharmacies(id),
    action_type TEXT NOT NULL CHECK (action_type IN ('stock_in', 'stock_out', 'adjustment')),
    quantity INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_type TEXT NOT NULL CHECK (recipient_type IN ('admin', 'pharmacy')),
    recipient_id UUID NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (email, password_hash, full_name, role) VALUES
('admin@pharmafinder.com', '$2a$10$xZtXg8XdwEyqBH0Y3YfqWOh3jXxK9mZ3v5J5x9J5J5J5J5J5J5', 'Admin User', 'super_admin');

-- Insert sample medicine categories
INSERT INTO medicine_categories (name, description, icon) VALUES
('Pain Relief', 'Medications for pain management', 'pill'),
('Antibiotics', 'Medications for bacterial infections', 'capsule'),
('Cold & Flu', 'Medications for cold and flu symptoms', 'virus'),
('Allergy', 'Medications for allergies', 'leaf'),
('Digestive Health', 'Medications for digestive issues', 'stomach'),
('Vitamins', 'Nutritional supplements', 'apple'),
('First Aid', 'First aid supplies and medications', 'bandage'),
('Chronic Care', 'Medications for chronic conditions', 'heart');

-- Create RLS policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX idx_activity_logs_admin_id ON activity_logs(admin_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_pharmacy_requests_status ON pharmacy_requests(status);
CREATE INDEX idx_inventory_logs_medicine_id ON inventory_logs(medicine_id);
CREATE INDEX idx_inventory_logs_pharmacy_id ON inventory_logs(pharmacy_id);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_type, recipient_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Add triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_pharmacy_requests_updated_at
    BEFORE UPDATE ON pharmacy_requests
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Create views for dashboard statistics
CREATE VIEW medicine_inventory_summary AS
SELECT 
    m.id,
    m.name,
    m.category,
    COUNT(DISTINCT mp.pharmacy_id) as pharmacy_count,
    COALESCE(SUM(CASE WHEN il.action_type = 'stock_in' THEN il.quantity ELSE -il.quantity END), 0) as total_stock
FROM medicines m
LEFT JOIN medicine_pharmacies mp ON m.id = mp.medicine_id
LEFT JOIN inventory_logs il ON m.id = il.medicine_id
GROUP BY m.id, m.name, m.category;
