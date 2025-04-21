
import { supabase } from "@/integrations/supabase/client";
import { PurchaseActivity } from "./types";

// Thresholds for suspicious activity
const MAX_PURCHASES_PER_DAY = 20;
const SUSPICIOUS_PURCHASE_AMOUNT = 500000; // In VND or account currency

const recentPurchaseActivity: PurchaseActivity[] = [];

function getClientInfo() {
  return {
    ip_address: "unknown", // Server-side update
    user_agent: navigator.userAgent,
    device_info: `${navigator.platform} - ${navigator.vendor}`
  };
}

/**
 * Record purchase attempt for fraud detection
 */
export async function recordPurchaseActivity(
  userId: string,
  amount: number,
  productId: string
) {
  const clientInfo = getClientInfo();

  const purchaseData: PurchaseActivity = {
    user_id: userId,
    amount,
    product_id: productId,
    timestamp: new Date(),
    ip_address: clientInfo.ip_address,
    device_info: clientInfo.device_info
  };

  recentPurchaseActivity.push(purchaseData);

  // Prune old (>24h)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  while (
    recentPurchaseActivity.length > 0 &&
    recentPurchaseActivity[0].timestamp < yesterday
  ) {
    recentPurchaseActivity.shift();
  }

  // Add to database
  try {
    await supabase.functions.invoke("fraud-detection", {
      body: {
        action: "record-purchase",
        data: {
          user_id: userId,
          amount,
          product_id: productId,
          ip_address: clientInfo.ip_address,
          device_info: clientInfo.device_info,
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error("Failed to record purchase for fraud detection:", error);
  }

  // Check for suspicious patterns
  return checkForSuspiciousPurchaseActivity(userId, amount);
}

/**
 * Check for suspicious purchase activity
 */
export function checkForSuspiciousPurchaseActivity(userId: string, amount: number): boolean {
  const recentUserPurchases = recentPurchaseActivity.filter(purchase =>
    purchase.user_id === userId &&
    purchase.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
  );
  if (recentUserPurchases.length > MAX_PURCHASES_PER_DAY) {
    console.warn(`Suspicious purchase activity: user ${userId} made ${recentUserPurchases.length} purchases in 24 hours`);
    return true;
  }
  if (amount > SUSPICIOUS_PURCHASE_AMOUNT) {
    console.warn(`Suspicious purchase amount: user ${userId} attempted to purchase ${amount}`);
    return true;
  }
  if (recentUserPurchases.length >= 3) {
    const sortedPurchases = [...recentUserPurchases].sort((a, b) =>
      a.timestamp.getTime() - b.timestamp.getTime()
    );
    const timeBetweenFirstAndLast =
      sortedPurchases[sortedPurchases.length - 1].timestamp.getTime() -
      sortedPurchases[sortedPurchases.length - 3].timestamp.getTime();
    if (timeBetweenFirstAndLast < 5 * 60 * 1000) {
      console.warn(`Suspicious rapid purchases: user ${userId} made 3 purchases in ${timeBetweenFirstAndLast / 1000} seconds`);
      return true;
    }
  }
  return false;
}
