
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserRole } from '@/types/auth.types';
import { ChevronDown, ShieldAlert, Shield, User } from 'lucide-react';

interface UserTableActionsProps {
  userId: string;
  roles?: UserRole[];
  isActive?: boolean;
  onAssignRole: (role: UserRole) => void;
  onToggleStatus: () => void;
}

export const UserTableActions = ({ 
  userId, 
  roles, 
  isActive, 
  onAssignRole, 
  onToggleStatus 
}: UserTableActionsProps) => {
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
            onClick={() => onAssignRole('admin')}
            disabled={roles?.includes('admin')}
          >
            <ShieldAlert className="mr-2 h-4 w-4" />
            <span>Admin</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onAssignRole('staff')}
            disabled={roles?.includes('staff')}
          >
            <Shield className="mr-2 h-4 w-4" />
            <span>Nhân viên</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onAssignRole('user')}
            disabled={roles?.includes('user')}
          >
            <User className="mr-2 h-4 w-4" />
            <span>Người dùng</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant={isActive !== false ? "destructive" : "default"}
        size="sm"
        onClick={onToggleStatus}
      >
        {isActive !== false ? "Khóa tài khoản" : "Kích hoạt"}
      </Button>
    </div>
  );
};
