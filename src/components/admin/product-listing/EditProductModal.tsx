import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Product, Category } from '@/types';
import { prepareTableUpdate } from '@/utils/databaseTypes';
import { castArrayData } from '@/utils/supabaseHelpers';

interface EditProductModalProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  onUpdate?: () => void;
}

export const EditProductModal = ({ 
  open,
  onClose,
  productId,
  onUpdate
}: EditProductModalProps) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<Partial<Product>>({
    id: '',
    title: '',
    description: '',
    price: 0,
    in_stock: true,
    slug: '',
    category_id: '',
    stock: 0,
  });
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (open && productId) {
      fetchProduct();
      fetchCategories();
    }
  }, [open, productId]);

  const fetchProduct = async () => {
    if (!productId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
        
      if (error) throw error;
      
      setProduct(data as Product);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      setCategories(castArrayData<Category>(data));
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleSwitchChange = (checked: boolean, name: string) => {
    setProduct({ ...product, [name]: checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Prepare product data for update
      const updatedData = {
        title: product.title,
        description: product.description,
        price: product.price,
        original_price: product.original_price,
        in_stock: product.in_stock,
        slug: product.slug,
        external_id: product.external_id,
        category_id: product.category_id,
        images: product.images,
        kiosk_token: product.kiosk_token,
        stock: product.stock,
      };
      
      const { error } = await supabase
        .from('products')
        .update(updatedData)
        .eq('id', productId);
        
      if (error) throw error;
      
      toast.success('Product updated successfully');
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading product details...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                type="text"
                id="title"
                name="title"
                value={product.title}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={product.description}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input
                type="number"
                id="price"
                name="price"
                value={product.price}
                onChange={(e) => handleInputChange({
                  ...e,
                  target: { ...e.target, value: parseFloat(e.target.value) }
                } as any)}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="original_price" className="text-right">
                Original Price
              </Label>
              <Input
                type="number"
                id="original_price"
                name="original_price"
                value={product.original_price || ''}
                onChange={(e) => handleInputChange({
                  ...e,
                  target: { ...e.target, value: parseFloat(e.target.value) }
                } as any)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">
                Stock
              </Label>
              <Input
                type="number"
                id="stock"
                name="stock"
                value={product.stock}
                onChange={(e) => handleInputChange({
                  ...e,
                  target: { ...e.target, value: parseInt(e.target.value) }
                } as any)}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="slug" className="text-right">
                Slug
              </Label>
              <Input
                type="text"
                id="slug"
                name="slug"
                value={product.slug}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="external_id" className="text-right">
                External ID
              </Label>
              <Input
                type="text"
                id="external_id"
                name="external_id"
                value={product.external_id || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category_id" className="text-right">
                Category
              </Label>
              <select
                id="category_id"
                name="category_id"
                value={product.category_id}
                onChange={handleInputChange}
                className="col-span-3 bg-white border rounded px-3 py-2"
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="kiosk_token" className="text-right">
                Kiosk Token
              </Label>
              <Input
                type="text"
                id="kiosk_token"
                name="kiosk_token"
                value={product.kiosk_token || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="in_stock" className="text-right">
                In Stock
              </Label>
              <Switch
                id="in_stock"
                name="in_stock"
                checked={product.in_stock}
                onCheckedChange={(checked) => handleSwitchChange(checked, "in_stock")}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditProductModal;
