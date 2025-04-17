import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function SupabaseTest() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function testConnection() {
      try {
        // Test the connection by trying to fetch pharmacies
        const { data, error } = await supabase
          .from('pharmacies')
          .select('count');

        if (error) {
          console.error('Connection error:', error);
          setStatus('error');
          setMessage(error.message);
          return;
        }

        setStatus('success');
        setMessage(`Successfully connected to Supabase! Found ${data[0]?.count || 0} pharmacies.`);
      } catch (err) {
        console.error('Unexpected error:', err);
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    }

    testConnection();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Supabase Connection Test</h2>
      {status === 'loading' && (
        <p className="text-gray-600">Testing connection to Supabase...</p>
      )}
      {status === 'success' && (
        <p className="text-green-600">{message}</p>
      )}
      {status === 'error' && (
        <p className="text-red-600">Error: {message}</p>
      )}
    </div>
  );
}
