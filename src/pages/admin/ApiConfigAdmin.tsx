
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Edit, Save, Plus, Check } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ApiConfig {
  id: string;
  name: string;
  user_token: string;
  is_active: boolean;
}

const ApiConfigAdmin = () => {
  const [configs, setConfigs] = useState<ApiConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    user_token: '',
    is_active: false,
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
    });
    setEditingId(config.id);
    setIsAdding(false);
  };

  const handleAddNew = () => {
    setFormData({
      name: '',
      user_token: '',
      is_active: false,
    });
    setEditingId(null);
    setIsAdding(true);
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
      });
      setEditingId(null);
      setIsAdding(false);
      fetchConfigs();
    } catch (error) {
      console.error('Error saving API config:', error);
      toast.error('Failed to save API configuration');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({
      name: '',
      user_token: '',
      is_active: false,
    });
  };

  return (
    <AdminLayout title="API Configuration">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="col-span-2">
          <div className="flex justify-between mb-6">
            <h2 className="text-xl font-semibold">API Configurations</h2>
            <Button onClick={handleAddNew}>
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>User Token</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Loading configurations...
                    </TableCell>
                  </TableRow>
                ) : configs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No API configurations found
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
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {config.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleEdit(config)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
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
                <CardTitle>{isAdding ? 'Add New Configuration' : 'Edit Configuration'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Configuration Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
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
                    />
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
                      Mark as active
                    </label>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Save className="w-4 h-4 mr-2" />
                      Save
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
