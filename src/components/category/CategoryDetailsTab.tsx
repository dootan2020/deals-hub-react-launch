
import { Card, CardContent } from '@/components/ui/card';
import { CategoryWithParent } from '@/types';
import { Calendar, Globe, Tag, Layers, Users } from 'lucide-react';

interface CategoryDetailsTabProps {
  category: CategoryWithParent;
}

export const CategoryDetailsTab = ({ category }: CategoryDetailsTabProps) => {
  if (!category) return null;

  // Format the date to be more readable
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Category Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">ID</p>
                <p className="text-base">{category.id}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Name</p>
                <p className="text-base">{category.name}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Slug</p>
                <p className="text-base">{category.slug}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                <p className="text-base">{category.description || 'No description available'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Created At</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-base">{formatDate(category.created_at)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Parent Category</p>
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <p className="text-base">{category.parent?.name || 'None (Top Level Category)'}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Icon</p>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <p className="text-base">{category.icon || 'No icon set'}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
