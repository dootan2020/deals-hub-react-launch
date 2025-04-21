
import { TableHeader, TableRow, TableHead } from '@/components/ui/table';

export const UserTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Người dùng</TableHead>
        <TableHead>Vai trò</TableHead>
        <TableHead>Ngày tạo</TableHead>
        <TableHead>Trạng thái</TableHead>
        <TableHead className="text-right">Thao tác</TableHead>
      </TableRow>
    </TableHeader>
  );
};
