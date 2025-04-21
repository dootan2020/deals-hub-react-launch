
import { UserWithRolesRow } from '@/integrations/supabase/types-extension';
import { UserRole } from '@/types/auth.types';
import { Table, TableBody } from '@/components/ui/table';
import { UserTableHeader } from './table/UserTableHeader';
import { UserTableRow } from './table/UserTableRow';
import { UserTablePagination } from './table/UserTablePagination';

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
  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <UserTableHeader />
          <TableBody>
            {loading && (
              <tr>
                <td colSpan={5} className="h-24 text-center">
                  Đang tải dữ liệu...
                </td>
              </tr>
            )}
            
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={5} className="h-24 text-center">
                  Không tìm thấy người dùng nào
                </td>
              </tr>
            )}

            {!loading && users.map(user => (
              <UserTableRow
                key={user.id}
                user={user}
                onAssignRole={onAssignRole}
                onRemoveRole={onRemoveRole}
                onToggleStatus={onToggleStatus}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <UserTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};
