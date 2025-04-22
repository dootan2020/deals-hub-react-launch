import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types';

// Use hardcoded values since environment variables are not accessible
const supabaseUrl = 'https://xcpwyvrlutlslgaueokd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjcHd5dnJsdXRsc2xnYXVlb2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTMwMDAsImV4cCI6MjA2MDMyOTAwMH0.6uScHil1Q02Mz-x6p_GQui7vchxIYLRcOCd8UsNiOp0';

// Only log minimal initialization info
console.log('Initializing Supabase client');

// Initialize the Supabase client with optimized settings to prevent session update loops
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
      debug: false, // Turn off debug mode to reduce noise
      lockSessionUpdateInterval: 30000, // Lock session updates to once every 30 seconds
    },
    realtime: {
      params: {
        eventsPerSecond: 5 // Reduce from 10 to 5
      }
    },
    global: {
      // Remove verbose logging from fetch
      fetch: undefined
    }
  }
);

// Test connection and log only critical info
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection error:', error.message);
  } else {
    console.log('Supabase connection successful. Auth status:', data.session ? 'Authenticated' : 'Not authenticated');
  }
});

// Rate limiting for session reload
const SESSION_RELOAD_COOLDOWN = 10000; // 10 seconds
let lastReloadTime = 0;

// Export a utility to reload session explicitly with rate limiting
export const reloadSession = async () => {
  const now = Date.now();
  
  // Apply rate limiting
  if (now - lastReloadTime < SESSION_RELOAD_COOLDOWN) {
    console.log('Session reload throttled. Try again later.');
    return { 
      success: false, 
      error: new Error('Too many session reload attempts. Please wait before trying again.'),
      rateLimited: true
    };
  }
  
  try {
    console.log('Reloading session...');
    lastReloadTime = now;
    
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('Failed to reload session:', error.message);
      return { success: false, error };
    }
    
    if (data.session) {
      console.log('Session reloaded successfully');
      return { success: true, data };
    } else {
      return { success: false, error: new Error('No session returned') };
    }
  } catch (err) {
    console.error('Error reloading session:', err);
    return { success: false, error: err };
  }
};

// Replace frequent heartbeat with a less intensive one
// Check connection only every 2 minutes instead of every 30 seconds
let heartbeatTimer: number | null = null;

const startHeartbeat = () => {
  // Clear any existing heartbeat
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
  }
  
  // Start a new heartbeat at a reduced frequency
  heartbeatTimer = window.setInterval(() => {
    // Use a simple ping that doesn't trigger any auth events
    supabase.functions.invoke('heartbeat', { 
      body: { ping: true },
      headers: { 'Prefer': 'return=minimal' } // Request minimal response to reduce load
    }).catch(() => {
      // Silent catch - just for connection testing
      // Don't log anything to avoid console spam
    });
  }, 120000); // Check every 2 minutes (was 30 seconds)
};

// Start heartbeat when client is first used
startHeartbeat();

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
  }
});
