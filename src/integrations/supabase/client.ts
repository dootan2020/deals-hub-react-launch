
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types';

// Use hardcoded values since environment variables are not accessible
const supabaseUrl = 'https://xcpwyvrlutlslgaueokd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjcHd5dnJsdXRsc2xnYXVlb2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTMwMDAsImV4cCI6MjA2MDMyOTAwMH0.6uScHil1Q02Mz-x6p_GQui7vchxIYLRcOCd8UsNiOp0';

// Add more detailed debug logging
console.log('Initializing Supabase client with:');
console.log('URL:', supabaseUrl);
console.log('Key valid:', supabaseAnonKey ? 'Yes (length: ' + supabaseAnonKey.length + ')' : 'No');

// Initialize the Supabase client with explicit persistence and auto-refresh settings
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: localStorage,
      flowType: 'implicit',
      debug: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    },
    global: {
      fetch: (...args) => {
        // Fixed: Properly type the args parameter to avoid spread operator issue
        const [url, options, ...rest] = args;
        console.debug('Supabase fetch:', url);
        return fetch(url, options, ...rest);
      }
    }
  }
);

// Test connection and log status
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection error:', error.message);
  } else {
    console.log('Supabase connection successful. Auth status:', data.session ? 'Authenticated' : 'Not authenticated');
    console.log('Session expires at:', data.session?.expires_at 
      ? new Date(data.session.expires_at * 1000).toLocaleString() 
      : 'No active session');
  }
});

// Export a utility to reload session explicitly
export const reloadSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('Failed to reload session:', error.message);
      return { success: false, error };
    }
    console.log('Session reloaded successfully, new expiry:', 
      data.session ? new Date(data.session.expires_at * 1000).toLocaleString() : 'No session');
    return { success: !!data.session, data };
  } catch (err) {
    console.error('Error reloading session:', err);
    return { success: false, error: err };
  }
};

// Add heartbeat to check connection
setInterval(() => {
  supabase.functions.invoke('heartbeat', { body: { ping: true } })
    .catch(err => {
      // Silent catch - just for connection testing
      console.debug('Supabase heartbeat failed:', err?.message || 'Unknown error');
    });
}, 30000); // Check every 30 seconds
