import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/layout/AdminLayout';
import { 
  Table, TableHeader, TableRow, TableCell, 
  TableHead, TableBody, 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserRole } from '@/types/auth.types';
import { ChevronDown, ShieldAlert, Users2, Shield, User, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { UserWithRolesRow } from '@/integrations/supabase/types-extension';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserWithRolesRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('users_with_roles')
        .select('*');

      if (error) {
        console.error('Error fetching users:', error);
        toast.error('Không thể tải danh sách người dùng');
        return;
      }

      setUsers(data as UserWithRolesRow[] || []);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      toast.error('Có lỗi khi tải dữ liệu người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const assignRole = async (userId: string, role: UserRole) => {
    try {
      const { error } = await supabase.rpc('assign_role', {
        user_id_param: userId,
        role_param: role
      });

      if (error) throw error;
      
      toast.success(`Đã thêm vai trò ${role} cho người dùng này`);
      fetchUsers();
    } catch (error: any) {
      toast.error(`Lỗi khi thêm vai trò: ${error.message}`);
    }
  };

  const removeRole = async (userId: string, role: UserRole) => {
    try {
      const { error } = await supabase.rpc('remove_role', {
        user_id_param: userId,
        role_param: role
      });

      if (error) throw error;
      
      toast.success(`Đã xóa vai trò ${role} khỏi người dùng này`);
      fetchUsers();
    } catch (error: any) {
      toast.error(`Lỗi khi xóa vai trò: ${error.message}`);
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-red-500 hover:bg-red-600';
      case 'staff': return 'bg-blue-500 hover:bg-blue-600';
      case 'user': return 'bg-green-500 hover:bg-green-600';
      case 'guest': return 'bg-gray-500 hover:bg-gray-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return <ShieldAlert className="h-3 w-3 mr-1" />;
      case 'staff': return <Shield className="h-3 w-3 mr-1" />;
      case 'user': return <User className="h-3 w-3 mr-1" />;
      case 'guest': return <Users2 className="h-3 w-3 mr-1" />;
      default: return <User className="h-3 w-3 mr-1" />;
    }
  };

  return (
    <AdminLayout title="Quản lý người dùng">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Danh sách người dùng</h2>
          <Button 
            variant="outline" 
            onClick={() => fetchUsers()}
            disabled={loading}
          >
            {loading ? 'Đang tải...' : 'Làm mới'}
          </Button>
        </div>

        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Đăng nhập cuối</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">{user.display_name || user.email.split('@')[0]}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles && user.roles.map(role => (
                          <Badge 
                            key={role} 
                            variant="secondary"
                            className={`flex items-center gap-1 ${getRoleBadgeColor(role)}`}
                          >
                            {getRoleIcon(role)}
                            {role}
                            <button 
                              onClick={() => removeRole(user.id, role)}
                              className="ml-1 rounded-full hover:bg-red-700 p-0.5"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                        {(!user.roles || user.roles.length === 0) && (
                          <span className="text-gray-500 italic">Chưa có vai trò</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      {user.last_sign_in_at 
                        ? new Date(user.last_sign_in_at).toLocaleDateString('vi-VN')
                        : 'Chưa đăng nhập'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            Thêm vai trò <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => assignRole(user.id, 'admin')}
                            disabled={user.roles?.includes('admin')}
                          >
                            <ShieldAlert className="mr-2 h-4 w-4" />
                            <span>Admin</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => assignRole(user.id, 'staff')}
                            disabled={user.roles?.includes('staff')}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Nhân viên</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => assignRole(user.id, 'user')}
                            disabled={user.roles?.includes('user')}
                          >
                            <User className="mr-2 h-4 w-4" />
                            <span>Người dùng</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Không có người dùng nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
