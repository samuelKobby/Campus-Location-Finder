# Campus Pharmacy Management System

A comprehensive pharmacy management system designed for campus pharmacies, allowing users to view and search for medicines across different campus pharmacy locations.

## Features

- View 7 different campus pharmacy locations
- Browse medicines by pharmacy
- Search for specific medicines
- View medicine details including prices and availability
- Modern and responsive user interface
- Secure authentication system

## Database Structure

### Tables

1. **Pharmacies**
   - Stores information about 7 campus pharmacies
   - Fields: id, name, location, hours, phone, available, image
   - Each pharmacy has its own unique set of medicines

2. **Medicines**
   - Contains 35 medicines (5 unique medicines per pharmacy)
   - Fields: id, name, description, category, unit, price, available, image, pharmacy_id
   - Linked to pharmacies through pharmacy_id
   - Includes high-quality images from Unsplash

3. **Users**
   - Manages user authentication
   - Roles: admin, staff
   - Secure password storage

4. **Inventory**
   - Tracks medicine quantities
   - Manages batch numbers and expiry dates

## Security Features

- Row Level Security (RLS) implemented
- Role-based access control
- Secure authentication using Supabase
- Protected API endpoints

## Setup Instructions

1. **Database Setup**
   ```bash
   # 1. Create a new Supabase project
   # 2. Copy your project URL and anon key to .env file
   # 3. Run the SQL scripts in this order:
   src/supabase/create_pharmacy.sql
   ```

2. **Environment Variables**
   Create a `.env` file with:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Sample Data

The system comes pre-configured with:
- 7 campus pharmacies with detailed information
- 35 medicines (5 unique medicines per pharmacy)
- High-quality images for all pharmacies and medicines
- Sample user roles and permissions

## Tech Stack

- Frontend: React + Vite
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth
- Styling: Tailwind CSS
- Image Hosting: Unsplash

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Images provided by Unsplash
- Database hosting by Supabase
- Icons from Heroicons
