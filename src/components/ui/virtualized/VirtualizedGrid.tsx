
import { forwardRef } from 'react';
import { FixedSizeGrid, GridChildComponentProps } from 'react-window';
import { cn } from '@/lib/utils';

export interface VirtualizedGridProps<T> {
  items: T[];
  columnCount: number;
  columnWidth: number;
  rowHeight: number;
  height: number;
  width?: number | string;
  className?: string;
  renderCell: (props: GridChildComponentProps<T[]>) => React.ReactElement;
  overscanRowCount?: number;
}

const VirtualizedGrid = <T extends unknown>({
  items,
  columnCount,
  columnWidth,
  rowHeight,
  height,
  width = '100%',
  className,
  renderCell,
  overscanRowCount = 2,
}: VirtualizedGridProps<T>) => {
  const rowCount = Math.ceil(items.length / columnCount);

  return (
    <FixedSizeGrid
      className={cn("scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent", className)}
      columnCount={columnCount}
      columnWidth={columnWidth}
      height={height}
      rowCount={rowCount}
      rowHeight={rowHeight}
      width={width}
      itemData={items}
      overscanRowCount={overscanRowCount}
    >
      {renderCell}
    </FixedSizeGrid>
  );
};

export default VirtualizedGrid;
