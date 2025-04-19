
import { Loader2 } from 'lucide-react';

const CategorySectionLoading = () => {
  return (
    <div className="text-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
      <p className="mt-4 text-text-light">Loading categories...</p>
    </div>
  );
};

export default CategorySectionLoading;
