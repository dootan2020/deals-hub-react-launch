
import React from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';

interface ViewToggleProps {
  currentView: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="flex items-center h-10">
      <div className="flex border rounded-md overflow-hidden">
        <Button
          variant="ghost"
          size="sm"
          className={`rounded-none px-3 ${
            currentView === 'grid' ? 'bg-gray-100' : ''
          }`}
          onClick={() => onViewChange('grid')}
          aria-label="Grid view"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`rounded-none px-3 ${
            currentView === 'list' ? 'bg-gray-100' : ''
          }`}
          onClick={() => onViewChange('list')}
          aria-label="List view"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ViewToggle;
