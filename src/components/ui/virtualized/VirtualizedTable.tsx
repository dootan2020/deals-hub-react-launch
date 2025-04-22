
import { forwardRef } from 'react';
import { FixedSizeList } from 'react-window';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface VirtualizedTableProps<T> {
  items: T[];
  columns: {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
  }[];
  height: number;
  itemSize: number;
  className?: string;
  onRowClick?: (item: T) => void;
}

const VirtualizedTable = <T extends Record<string, any>>({
  items,
  columns,
  height,
  itemSize,
  className,
  onRowClick,
}: VirtualizedTableProps<T>) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index];
    return (
      <TableRow
        style={style}
        className={cn("hover:bg-gray-50", onRowClick && "cursor-pointer")}
        onClick={() => onRowClick?.(item)}
      >
        {columns.map((column, cellIndex) => (
          <TableCell key={cellIndex}>
            {typeof column.accessor === 'function'
              ? column.accessor(item)
              : item[column.accessor]}
          </TableCell>
        ))}
      </TableRow>
    );
  };

  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => (
            <TableHead key={index}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody className="relative">
        <FixedSizeList
          height={height}
          itemCount={items.length}
          itemSize={itemSize}
          width="100%"
        >
          {Row}
        </FixedSizeList>
      </TableBody>
    </Table>
  );
};

export default VirtualizedTable;
