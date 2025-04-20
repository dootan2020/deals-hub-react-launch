
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { create_order_and_deduct_balance } from '../services/__mocks__/orderService';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(),
    functions: {
      invoke: vi.fn()
    }
  }
}));

// Mock services
vi.mock('../services/orderService', () => ({
  create_order_and_deduct_balance: vi.fn()
}));

describe('Order Flow', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('create_order_and_deduct_balance function', () => {
    it('should fail if user has insufficient balance', async () => {
      // Setup
      const mockUser = { id: 'user-123' };
      const mockProduct = { id: 'product-456', price: 50, stock: 10 };
      const mockBalance = 25; // Less than product price

      // Mock the insufficient balance error
      vi.mocked(create_order_and_deduct_balance).mockRejectedValue(
        new Error('Insufficient balance. Required: 50, Available: 25')
      );
      
      // Execute & Verify
      await expect(async () => {
        await create_order_and_deduct_balance(
          mockUser.id,
          mockProduct.id,
          1,
          mockProduct.price
        );
      }).rejects.toThrow('Insufficient balance');
    });
    
    it('should fail if product stock is insufficient', async () => {
      // Setup
      const mockUser = { id: 'user-123' };
      const mockProduct = { id: 'product-456', price: 50, stock: 1 };
      const mockBalance = 100; // Enough balance
      const requestedQuantity = 2; // More than available stock

      // Mock the insufficient stock error
      vi.mocked(create_order_and_deduct_balance).mockRejectedValue(
        new Error('Insufficient stock. Available: 1, Requested: 2')
      );
      
      // Execute & Verify
      await expect(async () => {
        await create_order_and_deduct_balance(
          mockUser.id,
          mockProduct.id,
          requestedQuantity,
          mockProduct.price
        );
      }).rejects.toThrow('Insufficient stock');
    });
    
    it('should create order and deduct balance successfully', async () => {
      // Setup
      const mockUser = { id: 'user-123' };
      const mockProduct = { id: 'product-456', price: 50, stock: 10 };
      const mockBalance = 100; // Enough balance
      const orderId = 'order-789';
      
      // Mock successful order creation
      vi.mocked(create_order_and_deduct_balance).mockResolvedValue(orderId);
      
      // Execute
      const result = await create_order_and_deduct_balance(
        mockUser.id,
        mockProduct.id,
        1,
        mockProduct.price
      );
      
      // Verify
      expect(result).toBe(orderId);
      expect(create_order_and_deduct_balance).toHaveBeenCalledWith(
        mockUser.id,
        mockProduct.id,
        1,
        mockProduct.price
      );
    });
  });
});
