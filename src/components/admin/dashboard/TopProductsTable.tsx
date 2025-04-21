
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";

interface ProductSalesData {
  id: string;
  title: string;
  sold: number;
  revenue: number;
  image?: string;
}

interface TopProductsTableProps {
  data: ProductSalesData[];
  isLoading?: boolean;
}

export const TopProductsTable = ({ data, isLoading = false }: TopProductsTableProps) => {
  const [sortBy, setSortBy] = useState<'sold' | 'revenue'>('revenue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const handleSort = (field: 'sold' | 'revenue') => {
    if (field === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };
  
  const sortedData = [...data].sort((a, b) => {
    const factor = sortOrder === 'asc' ? 1 : -1;
    return (a[sortBy] - b[sortBy]) * factor;
  });
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };
  
  const totalRevenue = data.reduce((acc, item) => acc + item.revenue, 0);
  const totalSold = data.reduce((acc, item) => acc + item.sold, 0);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sản phẩm bán chạy</CardTitle>
        <CardDescription>
          Top sản phẩm có doanh thu cao nhất
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-12 w-full mb-2" />
            <Skeleton className="h-12 w-full mb-2" />
            <Skeleton className="h-12 w-full mb-2" />
          </>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Sản phẩm</TableHead>
                <TableHead className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2"
                    onClick={() => handleSort('sold')}
                  >
                    Đã bán
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2"
                    onClick={() => handleSort('revenue')}
                  >
                    Doanh thu
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((product) => (
                <TableRow key={product.id} className="group hover:bg-muted/50 cursor-pointer">
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {product.image && (
                        <div className="mr-3 h-10 w-10 overflow-hidden rounded-md">
                          <img 
                            src={product.image} 
                            alt={product.title} 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                        </div>
                      )}
                      <span className="transition-colors group-hover:text-primary">{product.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{product.sold}</TableCell>
                  <TableCell className="text-right">{formatCurrency(product.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell>Tổng cộng</TableCell>
                <TableCell className="text-right">{totalSold}</TableCell>
                <TableCell className="text-right">{formatCurrency(totalRevenue)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
