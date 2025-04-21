
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserRole } from '@/types/auth.types';
import { ChevronDown, Loader, ShieldAlert, Shield, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface UserTableActionsProps {
  userId: string;
  roles?: UserRole[];
  isActive?: boolean;
  onAssignRole: (role: UserRole) => Promise<boolean>;
  onToggleStatus: () => Promise<boolean>;
}

export const UserTableActions = ({ 
  userId, 
  roles = [], 
  isActive, 
  onAssignRole, 
  onToggleStatus 
}: UserTableActionsProps) => {
  const [isRoleLoading, setIsRoleLoading] = useState<UserRole | null>(null);
  const [isStatusLoading, setIsStatusLoading] = useState(false);

  const handleAssignRole = async (role: UserRole) => {
    try {
      setIsRoleLoading(role);
      const success = await onAssignRole(role);
      if (success) {
        toast.success(`Đã thêm vai trò ${role} cho người dùng`);
      } else {
        toast.error(`Không thể thêm vai trò ${role}`);
      }
    } catch (error) {
      toast.error(`Lỗi khi thêm vai trò: ${error instanceof Error ? error.message : 'Đã có lỗi xảy ra'}`);
    } finally {
      setIsRoleLoading(null);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setIsStatusLoading(true);
      const success = await onToggleStatus();
      if (success) {
        toast.success(isActive ? 'Đã khóa tài khoản' : 'Đã kích hoạt tài khoản');
      } else {
        toast.error('Không thể thay đổi trạng thái tài khoản');
      }
    } catch (error) {
      toast.error(`Lỗi khi thay đổi trạng thái: ${error instanceof Error ? error.message : 'Đã có lỗi xảy ra'}`);
    } finally {
      setIsStatusLoading(false);
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Vai trò <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => handleAssignRole('admin')}
            disabled={roles?.includes('admin') || isRoleLoading !== null}
            className="gap-2"
          >
            {isRoleLoading === 'admin' ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldAlert className="h-4 w-4" />
            )}
            <span>Admin</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleAssignRole('staff')}
            disabled={roles?.includes('staff') || isRoleLoading !== null}
            className="gap-2"
          >
            {isRoleLoading === 'staff' ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Shield className="h-4 w-4" />
            )}
            <span>Nhân viên</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleAssignRole('user')}
            disabled={roles?.includes('user') || isRoleLoading !== null}
            className="gap-2"
          >
            {isRoleLoading === 'user' ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <User className="h-4 w-4" />
            )}
            <span>Người dùng</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant={isActive !== false ? "destructive" : "default"}
        size="sm"
        onClick={handleToggleStatus}
        disabled={isStatusLoading}
        className="min-w-[120px] relative"
      >
        {isStatusLoading ? (
          <>
            <Loader className="h-4 w-4 animate-spin mr-2" />
            <span>Đang xử lý...</span>
          </>
        ) : (
          <span>{isActive !== false ? "Khóa tài khoản" : "Kích hoạt"}</span>
        )}
      </Button>
    </div>
  );
};
