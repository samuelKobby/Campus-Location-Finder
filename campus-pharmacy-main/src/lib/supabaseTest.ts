import { supabase } from './supabase';

async function testSupabaseConnection() {
  try {
    // Test the connection by trying to fetch pharmacies
    const { data, error } = await supabase
      .from('pharmacies')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error connecting to Supabase:', error.message);
      return false;
    }

    console.log('Successfully connected to Supabase!');
    console.log('Test query result:', data);
    return true;
  } catch (err) {
    console.error('Unexpected error:', err);
    return false;
  }
}

// Run the test
testSupabaseConnection();
