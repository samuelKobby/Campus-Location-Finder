-- Function to create admin_users table
CREATE OR REPLACE FUNCTION create_admin_users_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    CREATE TABLE IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY REFERENCES auth.users(id),
        email TEXT NOT NULL UNIQUE,
        full_name TEXT,
        role TEXT DEFAULT 'admin',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create trigger for updated_at
    DROP TRIGGER IF EXISTS set_updated_at ON admin_users;
    CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON admin_users
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at_timestamp();
END;
$$;

-- Function to create activity_logs table
CREATE OR REPLACE FUNCTION create_activity_logs_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        action_type TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        details JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        user_id UUID REFERENCES auth.users(id)
    );
END;
$$;

-- Helper function for updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;
