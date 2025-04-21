
export interface ProductSales {
  id: string;
  title: string;
  sold: number;
  revenue: number;
  image?: string;
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product_id: string;
  product?: {
    title?: string;
    images?: string[];
  };
}

export const calculateProductSales = (orderItems: OrderItem[]): ProductSales[] => {
  const productSales: Record<string, ProductSales> = {};
  
  orderItems.forEach((item: OrderItem) => {
    if (item.product_id) {
      const productId = item.product_id.toString();
      if (!productSales[productId]) {
        productSales[productId] = {
          id: productId,
          title: item.product?.title || 'Unknown Product',
          sold: 0,
          revenue: 0,
          image: item.product?.images?.[0]
        };
      }
      
      productSales[productId].sold += item.quantity || 0;
      productSales[productId].revenue += (item.price * item.quantity) || 0;
    }
  });
  
  return Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
};
