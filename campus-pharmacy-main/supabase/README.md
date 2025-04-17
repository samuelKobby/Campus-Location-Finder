# Database Setup

This directory contains the database migrations for the Pharmar-Finder application. The migrations will create the following tables:

1. `medicines` - Stores medicine inventory data
2. `notifications` - Stores system notifications
3. `admin_users` - Stores admin user data

## Setting Up the Database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `migrations/20250209_create_tables.sql`
4. Paste it into the SQL Editor
5. Click "Run" to execute the migrations

## Tables Structure

### Medicines
- `id`: Unique identifier (auto-incrementing)
- `name`: Medicine name
- `category`: Medicine category
- `price`: Medicine price
- `stock`: Current stock quantity
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Notifications
- `id`: Unique identifier (auto-incrementing)
- `title`: Notification title
- `message`: Notification message
- `type`: Type of notification (info, success, warning, error)
- `read`: Whether the notification has been read
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Admin Users
- `id`: UUID (linked to auth.users)
- `full_name`: User's full name
- `email`: User's email (unique)
- `role`: User role (Admin, Pharmacist, Staff)
- `last_sign_in_at`: Last login timestamp
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## Row Level Security (RLS)

The migrations include RLS policies to ensure data security:

1. All authenticated users can read data from all tables
2. Only Admin users can modify admin_users data
3. Admin and Pharmacist users can modify medicines data
4. Only Admin users can create and update notifications

## Automatic Timestamps

The tables include triggers to automatically update the `updated_at` timestamp whenever a record is modified.
