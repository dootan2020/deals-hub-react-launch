
// Mock order service - placeholder after deletion
export const createOrder = async (orderData: any) => {
  console.log("Create order requested:", orderData);
  return { success: false, message: "Order functionality has been removed" };
};

export const checkOrderStatus = async (orderId: string) => {
  console.log("Check order status requested for:", orderId);
  return { status: "unavailable" };
};

export const processOrder = async (orderData: any) => {
  console.log("Process order requested:", orderData);
  return { success: false, message: "Order functionality has been removed" };
};

// Add the missing fetchProductStock function
export const fetchProductStock = async (kioskToken: string) => {
  console.log("Fetch product stock requested for kiosk token:", kioskToken);
  return { 
    success: "true", 
    stock: 10, 
    price: 100000, 
    name: "Mock Product" 
  };
};
