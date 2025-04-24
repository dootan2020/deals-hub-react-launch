import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// Initialize Supabase client with proper typing and explicit auth configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xcpwyvrlutlslgaueokd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjcHd5dnJsdXRsc2xnYXVlb2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTMwMDAsImV4cCI6MjA2MDMyOTAwMH0.6uScHil1Q02Mz-x6p_GQui7vchxIYLRcOCd8UsNiOp0';

// Log environment for debugging
console.log('============ SUPABASE CLIENT INIT ============');
console.log('SUPABASE URL:', supabaseUrl);
console.log('Environment:', import.meta.env.MODE || 'unknown');
console.log('Current origin:', window.location.origin);
console.log('Current hostname:', window.location.hostname);
console.log('==========================================');

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Configure Realtime client for order updates
export const configureRealtimeForOrders = () => {
  const channel = supabase.channel('table-db-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      (payload) => {
        console.log('Orders changed:', payload);
      }
    )
    .subscribe((status) => {
      console.log('Realtime subscription status:', status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
};

// Configure Realtime client for notification updates
export const configureRealtimeForNotifications = (userId: string) => {
  if (!userId) return () => {};

  const channel = supabase.channel('user-notifications')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications' },
      (payload) => {
        console.log('New notification:', payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const getPublicUrl = (bucketName: string, filePath: string) => {
  const { data } = supabase
    .storage
    .from(bucketName)
    .getPublicUrl(filePath);
  
  return data?.publicUrl;
};
