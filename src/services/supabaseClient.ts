
import { createClient } from '@supabase/supabase-js';

// NOTE: Update with your project's Supabase credentials as needed.
const SUPABASE_URL = 'https://xcpwyvrlutlslgaueokd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjcHd5dnJsdXRsc2xnYXVlb2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTMwMDAsImV4cCI6MjA2MDMyOTAwMH0.6uScHil1Q02Mz-x6p_GQui7vchxIYLRcOCd8UsNiOp0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
