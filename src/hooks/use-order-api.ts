
// Mock order API hook - placeholder after deletion
export const useOrderApi = () => {
  return {
    isLoading: false,
    createOrder: (orderData: any) => {
      console.log("Order creation attempted with data:", orderData);
      return Promise.resolve({ success: false, message: "Order functionality removed" });
    },
    checkOrder: ({ orderId }: { orderId: string }) => {
      console.log(`Order check attempted for ${orderId} but functionality removed`);
      return Promise.resolve({ success: false, message: "Order functionality removed" });
    },
    orderStatus: "unavailable",
    orderError: null,
    orderResult: null,
  };
};
