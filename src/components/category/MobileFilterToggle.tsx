
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MobileFilterToggleProps {
  onToggle: () => void;
  isOpen: boolean;
  activeFilterCount: number;
}

const MobileFilterToggle: React.FC<MobileFilterToggleProps> = ({
  onToggle,
  isOpen,
  activeFilterCount
}) => {
  return (
    <div className="md:hidden">
      <Button 
        variant="outline" 
        onClick={onToggle}
        className="flex items-center gap-2"
      >
        <Filter className="h-4 w-4" />
        Subcategories
        {activeFilterCount > 0 && (
          <Badge variant="secondary">{activeFilterCount}</Badge>
        )}
      </Button>
    </div>
  );
};

export default MobileFilterToggle;
