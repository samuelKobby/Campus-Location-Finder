import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ntrssgrcgqtqedcpudja.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50cnNzZ3JjZ3F0cWVkY3B1ZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4NDE1ODYsImV4cCI6MjA1NDQxNzU4Nn0.wcASruYcbYXO1Pl2_KWVYhJpH4wp7KAO0gSxWkWbMXc';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
