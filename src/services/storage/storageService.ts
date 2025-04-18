
import { supabase } from '@/integrations/supabase/client';

/**
 * Upload a file to Supabase storage
 */
export const uploadFile = async (
  bucket: string,
  file: File,
  path?: string,
  options?: {
    upsert?: boolean;
    cacheControl?: string;
  }
) => {
  try {
    // Generate a unique file name to prevent collisions
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    
    // Determine the full path including any subdirectory
    const fullPath = path ? `${path}/${fileName}` : fileName;
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fullPath, file, {
        upsert: options?.upsert || false,
        cacheControl: options?.cacheControl || '3600',
      });
      
    if (error) throw error;
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
      
    return {
      path: data.path,
      url: publicUrlData.publicUrl,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Delete a file from Supabase storage
 */
export const deleteFile = async (bucket: string, path: string) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Get a list of files from a storage bucket directory
 */
export const listFiles = async (bucket: string, path?: string) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path || '');
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

/**
 * Get a public URL for a file in storage
 */
export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
    
  return data.publicUrl;
};
