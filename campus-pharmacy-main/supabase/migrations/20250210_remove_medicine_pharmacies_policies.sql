-- Drop any existing RLS policies from medicine_pharmacies table
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."medicine_pharmacies";
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON "public"."medicine_pharmacies";
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON "public"."medicine_pharmacies";
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON "public"."medicine_pharmacies";

-- Disable RLS on the table
ALTER TABLE "public"."medicine_pharmacies" DISABLE ROW LEVEL SECURITY;

-- Grant all privileges to authenticated users
GRANT ALL ON "public"."medicine_pharmacies" TO authenticated;
