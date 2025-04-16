
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Edit, Save, Plus, Check, Link as LinkIcon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ApiConfig {
  id: string;
  name: string;
  user_token: string;
  is_active: boolean;
  kiosk_token: string;
}

const ApiConfigAdmin = () => {
  const [configs, setConfigs] = useState<ApiConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    user_token: '',
    is_active: false,
    kiosk_token: '',
  });

  const fetchConfigs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('api_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Error fetching API configs:', error);
      toast.error('Failed to fetch API configurations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_active: checked }));
  };

  const handleEdit = (config: ApiConfig) => {
    setFormData({
      name: config.name,
      user_token: config.user_token,
      is_active: config.is_active,
      kiosk_token: config.kiosk_token || '',
    });
    setEditingId(config.id);
    setIsAdding(false);
    setTestResult(null);
  };

  const handleAddNew = () => {
    setFormData({
      name: '',
      user_token: '',
      is_active: false,
      kiosk_token: '',
    });
    setEditingId(null);
    setIsAdding(true);
    setTestResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isAdding) {
        // Insert new config
        const { data, error } = await supabase
          .from('api_configs')
          .insert([formData])
          .select();
          
        if (error) throw error;
        toast.success('API configuration added successfully');
      } else if (editingId) {
        // Update existing config
        const { error } = await supabase
          .from('api_configs')
          .update(formData)
          .eq('id', editingId);
          
        if (error) throw error;
        toast.success('API configuration updated successfully');
      }
      
      // Reset form and fetch fresh data
      setFormData({
        name: '',
        user_token: '',
        is_active: false,
        kiosk_token: '',
      });
      setEditingId(null);
      setIsAdding(false);
      setTestResult(null);
      fetchConfigs();
    } catch (error) {
      console.error('Error saving API config:', error);
      toast.error('Failed to save API configuration');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setTestResult(null);
    setFormData({
      name: '',
      user_token: '',
      is_active: false,
      kiosk_token: '',
    });
  };

  const handleTestConnection = async () => {
    if (!formData.user_token || !formData.kiosk_token) {
      toast.error('Vui lòng nhập đầy đủ User Token và Kiosk Token');
      return;
    }
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`/functions/v1/product-sync?action=check&kioskToken=${formData.kiosk_token}&userToken=${formData.user_token}&_t=${timestamp}`);
      
      const data = await response.json();
      
      if (data.success === 'true') {
        setTestResult({
          success: true,
          message: `Kết nối thành công! Thông tin sản phẩm: ${data.name}, Còn ${data.stock || 0} sản phẩm, Giá: ${data.price || 0}`
        });
        toast.success('Kết nối đến taphoammo.net thành công!');
      } else {
        setTestResult({
          success: false,
          message: `Kết nối thất bại: ${data.description || 'Không thể lấy thông tin sản phẩm'}`
        });
        toast.error('Kết nối đến taphoammo.net thất bại');
      }
    } catch (error: any) {
      console.error('Error testing connection:', error);
      setTestResult({
        success: false,
        message: `Lỗi: ${error.message}`
      });
      toast.error(`Lỗi kết nối: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <AdminLayout title="API Configuration">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="col-span-2">
          <Card className="mb-6 p-4">
            <CardTitle className="mb-2">Kết nối API taphoammo.net</CardTitle>
            <CardDescription>
              Thiết lập kết nối đến API taphoammo.net để lấy thông tin sản phẩm. 
              Bạn cần có User Token hợp lệ và Kiosk Token cho sản phẩm mẫu để kiểm tra kết nối.
            </CardDescription>
            <div className="mt-4">
              <a 
                href="https://taphoammo.net/api/usertoken" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-primary"
              >
                <LinkIcon className="w-4 h-4 mr-1" />
                Đến trang lấy User Token
              </a>
            </div>
          </Card>
          
          <div className="flex justify-between mb-6">
            <h2 className="text-xl font-semibold">Cấu hình API</h2>
            <Button onClick={handleAddNew}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm mới
            </Button>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>User Token</TableHead>
                  <TableHead>Kiosk Token mẫu</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Đang tải cấu hình...
                    </TableCell>
                  </TableRow>
                ) : configs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Chưa có cấu hình API nào
                    </TableCell>
                  </TableRow>
                ) : (
                  configs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell>
                        <div className="font-medium">{config.name}</div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {config.user_token.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {config.kiosk_token?.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {config.is_active ? 'Đang sử dụng' : 'Không hoạt động'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleEdit(config)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Chỉnh sửa
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          {(isAdding || editingId) && (
            <Card>
              <CardHeader>
                <CardTitle>{isAdding ? 'Thêm cấu hình mới' : 'Chỉnh sửa cấu hình'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên cấu hình</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="VD: Cấu hình chính"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="user_token">User Token</Label>
                    <Input
                      id="user_token"
                      name="user_token"
                      value={formData.user_token}
                      onChange={handleInputChange}
                      required
                      placeholder="Nhập User Token từ taphoammo.net"
                    />
                    <p className="text-xs text-gray-500">User Token dùng để xác thực với API</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="kiosk_token">Kiosk Token mẫu</Label>
                    <Input
                      id="kiosk_token"
                      name="kiosk_token"
                      value={formData.kiosk_token}
                      onChange={handleInputChange}
                      required
                      placeholder="Nhập Kiosk Token của một sản phẩm mẫu"
                    />
                    <p className="text-xs text-gray-500">Kiosk Token mẫu để kiểm tra kết nối</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={handleCheckboxChange}
                    />
                    <label
                      htmlFor="is_active"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Đặt làm cấu hình mặc định
                    </label>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full" 
                      onClick={handleTestConnection}
                      disabled={isTesting}
                    >
                      {isTesting ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}
                    </Button>
                  </div>
                  
                  {testResult && (
                    <Alert variant={testResult.success ? "default" : "destructive"} className={testResult.success ? "bg-green-50 border-green-200" : ""}>
                      <AlertDescription>
                        {testResult.message}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Hủy
                    </Button>
                    <Button type="submit">
                      <Save className="w-4 h-4 mr-2" />
                      Lưu
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ApiConfigAdmin;
