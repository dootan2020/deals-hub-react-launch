
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useFormContext } from 'react-hook-form';

interface ImageUploaderProps {
  existingImages?: string[];
}

export function ImageUploader({ existingImages = [] }: ImageUploaderProps) {
  const form = useFormContext();
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>(existingImages);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter files by size (max 2MB)
    const validFiles = acceptedFiles.filter(file => file.size <= 2 * 1024 * 1024);
    
    // Check if adding these files would exceed the 10 file limit
    const totalFiles = previewUrls.length + validFiles.length;
    
    if (totalFiles > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }
    
    if (validFiles.length !== acceptedFiles.length) {
      toast.error('Some files were skipped (max size: 2MB)');
    }
    
    // Create preview URLs for the valid files
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    
    setFiles(prev => [...prev, ...validFiles]);
    setPreviewUrls(prev => [...prev, ...newPreviews]);
  }, [previewUrls.length]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 2 * 1024 * 1024, // 2MB
  });
  
  const removeFile = (index: number) => {
    // If it's a preview of a file to be uploaded
    if (index < files.length) {
      setFiles(files.filter((_, i) => i !== index));
    }
    
    // Remove from preview URLs
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
    
    // Update form value with remaining URLs
    const remainingUrls = previewUrls.filter((_, i) => i !== index).join('\n');
    form.setValue('images', remainingUrls);
  };
  
  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      // Upload each file to Supabase Storage
      for (const file of files) {
        const fileName = `${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);
        
        if (error) throw error;
        
        // Get public URL for the uploaded file
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(data.path);
        
        uploadedUrls.push(publicUrlData.publicUrl);
      }
      
      // Combine existing URLs with newly uploaded ones
      const existingUrls = form.getValues('images')
        ? form.getValues('images').split('\n').filter(Boolean)
        : [];
      
      const allUrls = [...existingUrls, ...uploadedUrls].join('\n');
      
      // Update form with all image URLs
      form.setValue('images', allUrls);
      
      // Clear file list since they're uploaded
      setFiles([]);
      
      toast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <FormItem>
      <FormLabel>Product Images</FormLabel>
      <FormControl>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-10 w-10 mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-medium">
            {isDragActive
              ? 'Drop the files here...'
              : 'Drag & drop images here, or click to select files'
            }
          </p>
          <p className="text-xs text-gray-500 mt-1">
            JPG, PNG, WebP • Max 2MB • Max 10 images
          </p>
        </div>
      </FormControl>

      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
          {previewUrls.map((url, index) => (
            <div 
              key={index} 
              className="relative group rounded-md overflow-hidden border border-gray-200"
              style={{ aspectRatio: '1/1' }}
            >
              <img 
                src={url} 
                alt={`Preview ${index}`} 
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 bg-white/80 backdrop-blur-sm p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <X className="h-4 w-4 text-gray-700" />
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <Button
          type="button"
          onClick={uploadFiles}
          disabled={isUploading}
          className="w-full mt-4"
        >
          {isUploading ? 'Uploading...' : `Upload ${files.length} image${files.length !== 1 ? 's' : ''}`}
        </Button>
      )}
      
      <FormDescription>
        Upload up to 10 product images. Images will be publicly visible.
      </FormDescription>
      <FormMessage />
    </FormItem>
  );
}
