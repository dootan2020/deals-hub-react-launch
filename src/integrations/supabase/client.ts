
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// Initialize Supabase client with proper typing and explicit auth configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xcpwyvrlutlslgaueokd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjcHd5dnJsdXRsc2xnYXVlb2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTMwMDAsImV4cCI6MjA2MDMyOTAwMH0.6uScHil1Q02Mz-x6p_GQui7vchxIYLRcOCd8UsNiOp0';

// Enhanced debug logging for auth issues
console.log('============ SUPABASE CLIENT INIT ============');
console.log('SUPABASE URL:', supabaseUrl);
console.log('Environment:', import.meta.env.MODE || 'unknown');
console.log('Current origin:', window.location.origin);
console.log('Current hostname:', window.location.hostname);
console.log('Current protocol:', window.location.protocol);
console.log('Current pathname:', window.location.pathname);
console.log('Current full URL:', window.location.href);
console.log('==========================================');

// Create Supabase client with expanded auth options
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      debug: true, // Enable debug mode for auth
      storage: localStorage,
    },
    global: {
      fetch: (input, init) => {
        // Convert input to string for logging
        const url = typeof input === 'string' 
          ? input 
          : input instanceof Request 
            ? input.url 
            : input.toString();
            
        console.log(`🔄 Supabase request to: ${url}`);
        
        return fetch(input, init).then(response => {
          console.log(`✅ Supabase response from: ${url}`, { status: response.status });
          return response;
        }).catch(error => {
          console.error(`❌ Supabase request error for: ${url}`, error);
          throw error;
        });
      }
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Export the URL for use in other files
export const getSupabaseUrl = () => supabaseUrl;

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

// Trả về URL cho việc chuyển hướng xác thực email
export const getSiteUrl = () => {
  const hostname = window.location.hostname;
  
  // Luôn sử dụng URL production cho môi trường production
  if (hostname === 'acczen.net' || hostname === 'www.acczen.net') {
    return 'https://acczen.net';
  }
  
  // Sử dụng Edge Function URL cho môi trường production để xử lý xác thực
  if (hostname === 'acczen.net' || hostname === 'www.acczen.net') {
    return 'https://xcpwyvrlutlslgaueokd.supabase.co/functions/v1/auth-redirect';
  }
  
  // Sử dụng origin cho môi trường phát triển và các môi trường khác
  return window.location.origin;
};

// Trả về URL xác thực với token
export const getAuthRedirectUrl = () => {
  const hostname = window.location.hostname;
  
  // Với môi trường production, sử dụng edge function proxy
  if (hostname === 'acczen.net' || hostname === 'www.acczen.net') {
    return 'https://xcpwyvrlutlslgaueokd.supabase.co/functions/v1/auth-redirect?redirect=https://acczen.net/auth/verified';
  }
  
  // Đối với môi trường dev, sử dụng direct URL
  return `${window.location.origin}/auth/verify`;
};
