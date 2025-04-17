-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor')) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON admin_users FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON admin_users FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON admin_users FOR UPDATE
    USING (auth.uid() = id);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for activity_logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for activity_logs
CREATE POLICY "Only admins can view activity logs"
    ON activity_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.role = 'admin'
        )
    );

CREATE POLICY "Only admins can insert activity logs"
    ON activity_logs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.role = 'admin'
        )
    );

-- Create functions and triggers
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.admin_users (id, email, full_name, role)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', COALESCE(new.raw_user_meta_data->>'role', 'admin'));
    RETURN new;
END;
$$ language plpgsql security definer;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
