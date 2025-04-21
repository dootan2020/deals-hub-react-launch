
import React from 'react';
import { Toggle } from '@/components/ui/toggle';
import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

export function ProductViewToggle({ view, onViewChange }: ProductViewToggleProps) {
  return (
    <div className="flex items-center gap-1 border rounded-md">
      <Button
        variant={view === 'grid' ? 'default' : 'ghost'}
        size="icon"
        className="h-9 w-9"
        onClick={() => onViewChange('grid')}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={view === 'list' ? 'default' : 'ghost'}
        size="icon"
        className="h-9 w-9"
        onClick={() => onViewChange('list')}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
