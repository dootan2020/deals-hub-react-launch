
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { CategoryWithParent } from "@/types";

interface CategoryHeaderProps {
  category: CategoryWithParent;
}

export const CategoryHeader = ({ category }: CategoryHeaderProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-2">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        {category.parent ? (
          <>
            <Link 
              to={`/category/${category.parent.slug}`}
              className="hover:text-primary"
            >
              {category.parent.name}
            </Link>
            <ChevronRight className="h-4 w-4" />
          </>
        ) : null}
        <Link 
          to={`/category/${category.slug}`}
          className="text-foreground font-medium"
        >
          {category.name}
        </Link>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold">{category.name}</h1>
      
      {category.description && (
        <p className="mt-2 text-muted-foreground max-w-3xl">
          {category.description}
        </p>
      )}
      
      {category.tags && category.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {category.tags.map((tag: string) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
