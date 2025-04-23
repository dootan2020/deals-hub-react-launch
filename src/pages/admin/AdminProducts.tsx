
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader,
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle, FileEdit, Trash, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Product, SyncStatus } from '@/types';
import { format } from 'date-fns';

interface ProductWithSyncStatus extends Product {
  syncStatus?: SyncStatus;
}

const productSchema = z.object({
  title: z.string().min(3, { message: "Tên sản phẩm phải có ít nhất 3 ký tự" }),
  price: z.coerce.number().min(0, { message: "Giá phải lớn hơn hoặc bằng 0" }),
  stock: z.coerce.number().int().min(0, { message: "Số lượng phải là số nguyên không âm" }),
  external_id: z.string().optional(),
  kiosk_token: z.string().optional(),
  slug: z.string().min(3, { message: "Slug phải có ít nhất 3 ký tự" })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug chỉ được chứa chữ thường, số và dấu gạch ngang"
    }),
  description: z.string().min(3, { message: "Mô tả sản phẩm phải có ít nhất 3 ký tự" }),
});

type ProductFormValues = z.infer<typeof productSchema>;

const AdminProducts = () => {
  const [products, setProducts] = useState<ProductWithSyncStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<ProductWithSyncStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncingProductId, setSyncingProductId] = useState<string | null>(null);

  const addForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      price: 0,
      stock: 0,
      external_id: '',
      kiosk_token: '',
      slug: '',
      description: '',
    },
  });

  const editForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      price: 0,
      stock: 0,
      external_id: '',
      kiosk_token: '',
      slug: '',
      description: '',
    },
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (currentProduct && isEditDialogOpen) {
      editForm.reset({
        title: currentProduct.title,
        price: currentProduct.price,
        stock: currentProduct.stock || 0,
        external_id: currentProduct.external_id || '',
        kiosk_token: currentProduct.kiosk_token || '',
        slug: currentProduct.slug || '',
        description: currentProduct.description || '',
      });
    }
  }, [currentProduct, isEditDialogOpen, editForm]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, price, stock, external_id, kiosk_token, slug, created_at, description, api_name, api_price, api_stock, last_synced_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          title: values.title,
          price: values.price,
          stock: values.stock,
          external_id: values.external_id || null,
          kiosk_token: values.kiosk_token || null,
          slug: values.slug,
          description: values.description,
        }])
        .select();
      
      if (error) throw error;
      
      toast.success('Thêm sản phẩm thành công');
      setIsAddDialogOpen(false);
      addForm.reset();
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Không thể thêm sản phẩm');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = async (values: ProductFormValues) => {
    if (!currentProduct) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          title: values.title,
          price: values.price,
          stock: values.stock,
          external_id: values.external_id || null,
          kiosk_token: values.kiosk_token || null,
          slug: values.slug,
          description: values.description,
        })
        .eq('id', currentProduct.id);
      
      if (error) throw error;
      
      toast.success('Cập nhật sản phẩm thành công');
      setIsEditDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Không thể cập nhật sản phẩm');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!currentProduct) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', currentProduct.id);
      
      if (error) throw error;
      
      toast.success('Xóa sản phẩm thành công');
      setIsDeleteDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Không thể xóa sản phẩm');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSyncProduct = async (product: ProductWithSyncStatus) => {
    if (!product.kiosk_token) {
      toast.error('Sản phẩm không có Kiosk Token');
      return;
    }

    // Update local state to show sync is in progress
    setSyncingProductId(product.id);
    setProducts(prevProducts => prevProducts.map(p => 
      p.id === product.id ? { ...p, syncStatus: 'loading' } : p
    ));

    try {
      // Get API config for userToken
      const { data: apiConfig, error: configError } = await supabase
        .from('api_configs')
        .select('user_token')
        .eq('is_active', true)
        .single();

      if (configError || !apiConfig) {
        throw new Error('Không tìm thấy cấu hình API');
      }

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('syncProductFromTaphoammo', {
        body: JSON.stringify({
          kioskToken: product.kiosk_token,
          userToken: apiConfig.user_token
        })
      });

      if (error || !data.success) {
        throw new Error(data?.error || error?.message || 'Không thể đồng bộ sản phẩm');
      }

      // Update local state to reflect successful sync
      setProducts(prevProducts => prevProducts.map(p => 
        p.id === product.id 
          ? { 
              ...p, 
              syncStatus: 'success',
              title: data.data.name,
              price: data.data.price,
              stock: data.data.stock,
              api_name: data.data.name,
              api_price: data.data.price,
              api_stock: data.data.stock,
              last_synced_at: new Date().toISOString()
            } 
          : p
      ));

      toast.success(`Đồng bộ thành công: ${data.data.name}`);
    } catch (error: any) {
      console.error('Error syncing product:', error);
      
      // Update local state to show sync failed
      setProducts(prevProducts => prevProducts.map(p => 
        p.id === product.id ? { ...p, syncStatus: 'error' } : p
      ));
      
      toast.error(`Lỗi đồng bộ: ${error.message}`);
    } finally {
      // Clear syncing state after a delay
      setTimeout(() => {
        setProducts(prevProducts => prevProducts.map(p => 
          p.id === product.id ? { ...p, syncStatus: 'idle' } : p
        ));
        setSyncingProductId(null);
      }, 3000);
    }
  };

  const openEditDialog = (product: ProductWithSyncStatus) => {
    setCurrentProduct(product);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (product: ProductWithSyncStatus) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const formatSyncDate = (dateString?: string) => {
    if (!dateString) return 'Chưa đồng bộ';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (e) {
      return 'Không hợp lệ';
    }
  };

  const getSyncButtonProps = (product: ProductWithSyncStatus) => {
    if (!product.kiosk_token) {
      return {
        disabled: true,
        title: 'Sản phẩm không có Kiosk Token',
        variant: 'ghost' as const
      };
    }

    switch (product.syncStatus) {
      case 'loading':
        return {
          disabled: true,
          title: 'Đang đồng bộ...',
          variant: 'ghost' as const,
          children: <Loader2 className="h-4 w-4 animate-spin" />
        };
      case 'success':
        return {
          disabled: false,
          title: 'Đồng bộ thành công',
          variant: 'ghost' as const,
          className: 'text-green-500'
        };
      case 'error':
        return {
          disabled: false,
          title: 'Đồng bộ thất bại. Nhấp để thử lại',
          variant: 'ghost' as const,
          className: 'text-red-500'
        };
      default:
        return {
          disabled: syncingProductId !== null,
          title: 'Đồng bộ giá & tồn kho',
          variant: 'ghost' as const
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý sản phẩm</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Thêm sản phẩm</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Thêm sản phẩm mới</DialogTitle>
              <DialogDescription>
                Điền thông tin sản phẩm mới vào mẫu dưới đây.
              </DialogDescription>
            </DialogHeader>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(handleAddProduct)} className="space-y-4">
                <FormField
                  control={addForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên sản phẩm</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên sản phẩm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá (USD)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số lượng</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={addForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả sản phẩm</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập mô tả sản phẩm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="vi-du-slug" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="external_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>External ID (tùy chọn)</FormLabel>
                        <FormControl>
                          <Input placeholder="ID từ API bên ngoài" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="kiosk_token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Token (tùy chọn)</FormLabel>
                        <FormControl>
                          <Input placeholder="Token kết nối API" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full md:w-auto"
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Thêm sản phẩm
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách sản phẩm</CardTitle>
          <CardDescription>
            Quản lý tất cả các sản phẩm trong hệ thống.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên sản phẩm</TableHead>
                    <TableHead>Giá (USD)</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Kiosk Token</TableHead>
                    <TableHead>Đồng bộ lần cuối</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length > 0 ? (
                    products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.title}</TableCell>
                        <TableCell>${product.price}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>{product.slug}</TableCell>
                        <TableCell>{product.kiosk_token || '-'}</TableCell>
                        <TableCell>{formatSyncDate(product.last_synced_at)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(product)}
                            >
                              <FileEdit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant={getSyncButtonProps(product).variant}
                              size="icon"
                              onClick={() => handleSyncProduct(product)}
                              disabled={getSyncButtonProps(product).disabled}
                              title={getSyncButtonProps(product).title}
                              className={getSyncButtonProps(product).className}
                            >
                              {getSyncButtonProps(product).children || <RefreshCw className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(product)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-100"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        Không có sản phẩm nào. Thêm sản phẩm mới để bắt đầu.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin sản phẩm.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditProduct)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên sản phẩm</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá (USD)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số lượng</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả sản phẩm</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="external_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>External ID (tùy chọn)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="kiosk_token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Token (tùy chọn)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full md:w-auto"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cập nhật
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa sản phẩm</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa sản phẩm "{currentProduct?.title}"? 
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              disabled={isSubmitting}
              onClick={handleDeleteProduct}
              className="w-full sm:w-auto"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xóa sản phẩm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
