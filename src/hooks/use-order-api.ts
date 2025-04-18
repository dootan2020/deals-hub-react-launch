
// Mock order API hook - placeholder after deletion
export const useOrderApi = () => {
  return {
    isLoading: false,
    createOrder: () => console.log("Order creation attempted but functionality removed"),
    checkOrder: ({ orderId }: { orderId: string }) => console.log(`Order check attempted for ${orderId} but functionality removed`),
    orderStatus: "unavailable",
    orderError: null,
    orderResult: null,
  };
};
