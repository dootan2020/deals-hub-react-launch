
import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import { formatDistanceToNow } from 'date-fns';
import { Category } from "@/types";

// Define product interface based on the database schema
interface Product {
  id: string;
  title: string;
  price: number;
  original_price?: number | null;
  in_stock: boolean;
  category_id?: string | null;
  categories?: Category;
  created_at: string;
  slug: string;
  description: string;
}

// Props interface for the component
interface ProductListingTableProps {
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => Promise<void>;
}

const PAGE_SIZE = 10;

export function ProductListingTable({
  products,
  categories,
  isLoading,
  onEdit,
  onDelete
}: ProductListingTableProps) {
  // State for sorting
  const [sortField, setSortField] = useState<keyof Product>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  
  // State for delete confirmation
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Handle sorting
  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Get category name from category_id
  const getCategoryName = (categoryId: string | null | undefined) => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "Unknown";
  };
  
  // Handle delete confirmation
  const handleDeleteClick = (productId: string) => {
    setDeleteProductId(productId);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle delete action
  const handleConfirmDelete = async () => {
    if (!deleteProductId) return;
    
    setIsDeleting(true);
    try {
      await onDelete(deleteProductId);
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setDeleteProductId(null);
    }
  };
  
  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    if (sortField === 'title' || sortField === 'slug' || sortField === 'created_at') {
      const aValue = String(a[sortField]);
      const bValue = String(b[sortField]);
      
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else if (sortField === 'price') {
      const aValue = Number(a[sortField] || 0);
      const bValue = Number(b[sortField] || 0);
      
      return sortDirection === 'asc' 
        ? aValue - bValue
        : bValue - aValue;
    }
    
    return 0;
  });
  
  // Paginate products
  const totalPages = Math.ceil(sortedProducts.length / PAGE_SIZE);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  
  // Generate pagination items
  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // Always show first page
      items.push(1);
      
      // Calculate range around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust range if at the beginning or end
      if (currentPage <= 2) {
        endPage = Math.min(totalPages - 1, 4);
      } else if (currentPage >= totalPages - 1) {
        startPage = Math.max(2, totalPages - 3);
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        items.push('ellipsis-start');
      }
      
      // Add pages around current page
      for (let i = startPage; i <= endPage; i++) {
        items.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        items.push('ellipsis-end');
      }
      
      // Always show last page
      items.push(totalPages);
    }
    
    return items;
  };

  // Render table content
  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableCaption>
            {isLoading ? (
              "Loading products..."
            ) : products.length === 0 ? (
              "No products found. Add your first product above."
            ) : (
              `Showing ${paginatedProducts.length} of ${products.length} products`
            )}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">
                <Button 
                  variant="ghost" 
                  className="p-0 hover:bg-transparent"
                  onClick={() => handleSort('title')}
                >
                  <span>Product Name</span>
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  className="p-0 hover:bg-transparent"
                  onClick={() => handleSort('price')}
                >
                  <span>Price</span>
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  className="p-0 hover:bg-transparent"
                  onClick={() => handleSort('created_at')}
                >
                  <span>Created</span>
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">Loading products...</div>
                </TableCell>
              </TableRow>
            ) : paginatedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex justify-center">
                    <AlertCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">No products found</div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div>{product.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{product.slug}</div>
                  </TableCell>
                  <TableCell>{getCategoryName(product.category_id)}</TableCell>
                  <TableCell>
                    {product.original_price && product.original_price > product.price ? (
                      <div>
                        <span className="font-medium">{product.price.toLocaleString()} VND</span>
                        <span className="text-xs line-through text-muted-foreground ml-2">
                          {product.original_price.toLocaleString()} VND
                        </span>
                      </div>
                    ) : (
                      <span className="font-medium">{product.price.toLocaleString()} VND</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {product.in_stock ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        In Stock
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Out of Stock
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {product.created_at ? formatDistanceToNow(new Date(product.created_at), { addSuffix: true }) : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => handleDeleteClick(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {getPaginationItems().map((item, index) => (
              item === 'ellipsis-start' || item === 'ellipsis-end' ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={index}>
                  <PaginationLink
                    isActive={currentPage === item}
                    onClick={() => typeof item === 'number' && setCurrentPage(item)}
                    className={typeof item === 'number' ? "cursor-pointer" : ""}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              )
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full inline-block"></div>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
