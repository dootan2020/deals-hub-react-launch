
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types';

// Use hardcoded values since environment variables are not accessible
const supabaseUrl = 'https://xcpwyvrlutlslgaueokd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjcHd5dnJsdXRsc2xnYXVlb2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTMwMDAsImV4cCI6MjA2MDMyOTAwMH0.6uScHil1Q02Mz-x6p_GQui7vchxIYLRcOCd8UsNiOp0';

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
)
