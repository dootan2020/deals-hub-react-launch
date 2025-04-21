
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';

interface UserTablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const UserTablePagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: UserTablePaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-end px-4 py-4 border-t">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => currentPage > 1 && onPageChange(currentPage - 1)} 
              className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""} 
            />
          </PaginationItem>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={currentPage === page}
                onClick={() => onPageChange(page)}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)} 
              className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""} 
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
