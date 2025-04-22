
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { UserProfile, DatabaseUserProfile } from '@/types/auth.types';
import { toast } from 'sonner';

const PROFILE_CACHE_KEY = 'user_profile';
const PROFILE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mapDatabaseProfileToUserProfile = (dbProfile: DatabaseUserProfile): UserProfile => ({
    id: dbProfile.id,
    email: null, // Will be set from auth user
    displayName: dbProfile.display_name || null,
    avatarUrl: null,
    roles: dbProfile.roles || ['user'],
    balance: dbProfile.balance || 0,
    emailVerified: dbProfile.email_verified || false,
    createdAt: dbProfile.created_at || new Date().toISOString(),
    updatedAt: dbProfile.updated_at || new Date().toISOString()
  });

  const getCachedProfile = (): UserProfile | null => {
    try {
      const cached = localStorage.getItem(PROFILE_CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > PROFILE_CACHE_TTL) {
        localStorage.removeItem(PROFILE_CACHE_KEY);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Error reading cached profile:', error);
      return null;
    }
  };

  const cacheProfile = (profile: UserProfile) => {
    try {
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({
        data: profile,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Error caching profile:', error);
    }
  };

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Try cache first
      const cached = getCachedProfile();
      if (cached && cached.id === userId) {
        setProfile(cached);
        return cached;
      }

      // Fetch from database
      const { data: dbProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Fetch roles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      const roles = (rolesData || []).map(r => r.role);
      
      const userProfile = mapDatabaseProfileToUserProfile({
        ...dbProfile,
        roles
      });

      setProfile(userProfile);
      cacheProfile(userProfile);
      return userProfile;
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError(error);
      toast.error('Error loading user profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (userId: string, updates: Partial<UserProfile>) => {
    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: updates.displayName,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Invalidate cache
      localStorage.removeItem(PROFILE_CACHE_KEY);

      // Re-fetch profile
      await fetchProfile(userId);

      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error);
      toast.error('Error updating profile');
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    clearProfile: () => {
      setProfile(null);
      localStorage.removeItem(PROFILE_CACHE_KEY);
    }
  };
};
