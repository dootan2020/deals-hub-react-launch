
import { UserWithRolesRow } from '@/integrations/supabase/types-extension';
import { UserRole } from '@/types/auth.types';
import { TableRow, TableCell } from '@/components/ui/table';
import { UserRoleBadges } from './UserRoleBadges';
import { UserStatusBadge } from './UserStatusBadge';
import { UserTableActions } from './UserTableActions';

interface UserTableRowProps {
  user: UserWithRolesRow;
  onAssignRole: (userId: string, role: UserRole) => Promise<boolean>;
  onRemoveRole: (userId: string, role: UserRole) => Promise<boolean>;
  onToggleStatus: (userId: string, currentStatus?: boolean) => Promise<boolean>;
}

export const UserTableRow = ({
  user,
  onAssignRole,
  onRemoveRole,
  onToggleStatus,
}: UserTableRowProps) => {
  return (
    <TableRow key={user.id}>
      <TableCell>
        <div className="font-medium">{user.display_name || user.email.split('@')[0]}</div>
        <div className="text-sm text-muted-foreground">{user.email}</div>
      </TableCell>
      <TableCell>
        <UserRoleBadges 
          roles={user.roles} 
          onRemoveRole={(role) => onRemoveRole(user.id, role)} 
        />
      </TableCell>
      <TableCell>
        {new Date(user.created_at).toLocaleDateString('vi-VN')}
      </TableCell>
      <TableCell>
        <UserStatusBadge isActive={user.is_active !== false} />
      </TableCell>
      <TableCell className="text-right">
        <UserTableActions
          userId={user.id}
          roles={user.roles}
          isActive={user.is_active}
          onAssignRole={(role) => onAssignRole(user.id, role)}
          onToggleStatus={() => onToggleStatus(user.id, user.is_active)}
        />
      </TableCell>
    </TableRow>
  );
};
