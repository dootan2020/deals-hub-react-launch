
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types';

// Use hardcoded values since environment variables are not accessible
const supabaseUrl = 'https://xcpwyvrlutlslgaueokd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjcHd5dnJsdXRsc2xnYXVlb2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTMwMDAsImV4cCI6MjA2MDMyOTAwMH0.6uScHil1Q02Mz-x6p_GQui7vchxIYLRcOCd8UsNiOp0';

// Add more detailed debug logging
console.log('Initializing Supabase client with:');
console.log('URL:', supabaseUrl);
console.log('Key valid:', supabaseAnonKey ? 'Yes (length: ' + supabaseAnonKey.length + ')' : 'No');

// Initialize the Supabase client
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// Test connection and log status
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection error:', error.message);
  } else {
    console.log('Supabase connection successful. Auth status:', data.session ? 'Authenticated' : 'Not authenticated');
  }
});
