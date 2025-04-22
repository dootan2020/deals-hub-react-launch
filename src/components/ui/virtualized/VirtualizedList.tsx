
import { forwardRef } from 'react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { cn } from '@/lib/utils';

export interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemSize: number;
  width?: number | string;
  className?: string;
  renderItem: (props: ListChildComponentProps<T[]>) => React.ReactElement;
  overscanCount?: number;
}

const VirtualizedList = <T extends unknown>({
  items,
  height,
  itemSize,
  width = '100%',
  className,
  renderItem,
  overscanCount = 5,
}: VirtualizedListProps<T>) => {
  return (
    <FixedSizeList
      className={cn("scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent", className)}
      height={height}
      itemCount={items.length}
      itemSize={itemSize}
      width={width}
      itemData={items}
      overscanCount={overscanCount}
    >
      {renderItem}
    </FixedSizeList>
  );
};

export default VirtualizedList;
