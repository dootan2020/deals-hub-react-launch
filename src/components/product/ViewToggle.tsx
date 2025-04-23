
import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid, List } from 'lucide-react';

interface ViewToggleProps {
  currentView: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="flex border rounded-md overflow-hidden">
      <Button
        variant={currentView === 'grid' ? 'default' : 'ghost'}
        size="sm"
        className={`rounded-none ${currentView === 'grid' ? 'bg-primary text-white' : ''}`}
        onClick={() => onViewChange('grid')}
      >
        <Grid className="h-4 w-4 mr-1" />
        <span className="sr-only md:not-sr-only md:inline">Grid</span>
      </Button>
      
      <Button
        variant={currentView === 'list' ? 'default' : 'ghost'}
        size="sm"
        className={`rounded-none ${currentView === 'list' ? 'bg-primary text-white' : ''}`}
        onClick={() => onViewChange('list')}
      >
        <List className="h-4 w-4 mr-1" />
        <span className="sr-only md:not-sr-only md:inline">List</span>
      </Button>
    </div>
  );
};

export default ViewToggle;
