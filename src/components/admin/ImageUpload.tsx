
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface ImageUploadProps {
  images?: string[];
  onChange: (images: string[]) => void;
  value?: string[];
}

const ImageUpload = ({ images = [], onChange, value = [] }: ImageUploadProps) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  
  // Determine which array to use
  const currentImages = value.length > 0 ? value : images;

  const handleAddImage = () => {
    if (!imageUrl.trim()) return;
    
    const updatedImages = [...currentImages, imageUrl.trim()];
    onChange(updatedImages);
    setImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...currentImages];
    updatedImages.splice(index, 1);
    onChange(updatedImages);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddImage();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input 
          value={imageUrl} 
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Enter image URL"
          onKeyDown={handleKeyDown}
        />
        <Button type="button" onClick={handleAddImage} variant="outline">
          Add
        </Button>
      </div>

      {currentImages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentImages.map((url, index) => (
            <div key={index} className="relative group">
              <img 
                src={url} 
                alt={`Product image ${index + 1}`} 
                className="w-full h-32 object-cover rounded-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/300x200?text=Invalid+Image';
                }}
              />
              <Button 
                variant="destructive" 
                size="icon"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
              <p className="mt-1 text-xs text-gray-500 truncate">{url}</p>
            </div>
          ))}
        </div>
      )}
      
      {currentImages.length === 0 && (
        <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-md">
          <p className="text-muted-foreground">No images added yet</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
