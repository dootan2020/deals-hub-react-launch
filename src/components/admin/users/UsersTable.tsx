
import { UserWithRolesRow } from '@/integrations/supabase/types-extension';
import { UserRole } from '@/types/auth.types';
import { 
  Table, TableHeader, TableRow, TableCell, 
  TableHead, TableBody, 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ShieldAlert, Shield, User, Trash2, ChevronDown, Check, X } from 'lucide-react';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';

interface UsersTableProps {
  users: UserWithRolesRow[];
  currentPage: number;
  totalPages: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onAssignRole: (userId: string, role: UserRole) => Promise<boolean>;
  onRemoveRole: (userId: string, role: UserRole) => Promise<boolean>;
  onToggleStatus: (userId: string, currentStatus?: boolean) => Promise<boolean>;
}

export const UsersTable = ({
  users,
  currentPage,
  totalPages,
  loading,
  onPageChange,
  onAssignRole,
  onRemoveRole,
  onToggleStatus
}: UsersTableProps) => {

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
      case 'guest': return <User className="h-3 w-3 mr-1" />;
      default: return <User className="h-3 w-3 mr-1" />;
    }
  };

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            )}
            
            {!loading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Không tìm thấy người dùng nào
                </TableCell>
              </TableRow>
            )}

            {!loading && users.map(user => (
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
                        className={`flex items-center gap-1 text-white ${getRoleBadgeColor(role)}`}
                      >
                        {getRoleIcon(role)}
                        {role}
                        <button 
                          onClick={() => onRemoveRole(user.id, role)}
                          className="ml-1 rounded-full hover:bg-red-700 p-0.5"
                          aria-label={`Xóa vai trò ${role}`}
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
                  {user.is_active !== false ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Đang hoạt động
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      <X className="h-3.5 w-3.5 mr-1" />
                      Đã khóa
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Vai trò <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => onAssignRole(user.id, 'admin')}
                          disabled={user.roles?.includes('admin')}
                        >
                          <ShieldAlert className="mr-2 h-4 w-4" />
                          <span>Admin</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onAssignRole(user.id, 'staff')}
                          disabled={user.roles?.includes('staff')}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Nhân viên</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onAssignRole(user.id, 'user')}
                          disabled={user.roles?.includes('user')}
                        >
                          <User className="mr-2 h-4 w-4" />
                          <span>Người dùng</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      variant={user.is_active !== false ? "destructive" : "default"}
                      size="sm"
                      onClick={() => onToggleStatus(user.id, user.is_active)}
                    >
                      {user.is_active !== false ? "Khóa tài khoản" : "Kích hoạt"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end px-4 py-4 border-t">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => currentPage > 1 && onPageChange(currentPage - 1)} 
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""} 
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={currentPage === page}
                    onClick={() => onPageChange(page)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)} 
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""} 
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};
