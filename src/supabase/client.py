from supabase import create_client
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")
supabase = create_client(supabase_url, supabase_key)

# For admin operations that require service role
supabase_service_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase_admin = create_client(supabase_url, supabase_service_key)
