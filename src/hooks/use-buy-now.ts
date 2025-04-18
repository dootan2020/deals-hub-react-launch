
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { placeOrder, waitForOrderProcessing } from '@/services/orderService';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

interface UseBuyNowProps {
  kioskToken: string;
  productId?: string;
  quantity: number;
  promotionCode?: string;
  onSuccess?: () => void;
  product?: Product;
}

export function useBuyNow({
  kioskToken,
  productId,
  quantity,
  promotionCode,
  onSuccess,
  product
}: UseBuyNowProps) {
  const [loading, setLoading] = useState(false);
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [orderProducts, setOrderProducts] = useState<any[] | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    
    if (product) {
      setShowConfirmation(true);
      return;
    }
    
    proceedWithOrder();
  };
  
  const proceedWithOrder = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!kioskToken || kioskToken.trim() === '') {
        throw new Error('Product information is incomplete: missing kiosk token');
      }
      
      if (quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }
      
      const orderResponse = await placeOrder({
        kioskToken,
        quantity,
        promotionCode
      });
      
      if (orderResponse.success !== "true" || !orderResponse.order_id) {
        throw new Error(orderResponse.description || 'Order failed');
      }
      
      setOrderId(orderResponse.order_id);
      setOrderProcessing(true);
      toast.info('Order placed! Processing your request...', {
        duration: 3000,
      });
      
      const products = await waitForOrderProcessing(orderResponse.order_id);
      
      setOrderProducts(products);
      setShowModal(true);
      setOrderProcessing(false);
      
      toast.success('Order completed successfully!', {
        duration: 5000,
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
      toast.error('Order failed: ' + (err.message || 'Unknown error'), {
        duration: 5000,
      });
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };
  
  const handleConfirmPurchase = async () => {
    if (!user || !product || !productId) {
      toast.error('Missing required information to complete purchase');
      return;
    }
    
    try {
      const totalAmount = product.price * quantity;
      
      const { data, error } = await supabase.functions.invoke('process-purchase', {
        body: {
          userId: user.id,
          productId,
          quantity,
          totalAmount,
          kioskToken,
          promotionCode
        }
      });
      
      if (error) throw new Error(error.message || 'Failed to process purchase');
      if (!data.success) throw new Error(data.message || 'Purchase failed');
      
      setShowConfirmation(false);
      setOrderId(data.orderId);
      setOrderProducts(data.orderData);
      setShowModal(true);
      
      toast.success('Purchase completed successfully!', {
        duration: 5000,
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err.message || 'An unknown error occurred');
    }
  };
  
  const retryProcessing = async () => {
    if (!orderId) return;
    
    setRetrying(true);
    setError(null);
    
    try {
      const products = await waitForOrderProcessing(orderId, 1);
      setOrderProducts(products);
      setShowModal(true);
      setOrderProcessing(false);
      
      toast.success('Order data retrieved successfully!');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Still processing, please try again later');
      toast.error('Failed to retrieve order data: ' + (err.message || 'Unknown error'));
    } finally {
      setRetrying(false);
    }
  };

  return {
    loading,
    orderProcessing,
    error,
    retrying,
    orderProducts,
    orderId,
    showModal,
    showConfirmation,
    setShowModal,
    setShowConfirmation,
    handleBuyNow,
    handleConfirmPurchase,
    retryProcessing
  };
}
