
/**
 * Utility for fraud detection and prevention
 */

import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Thresholds for suspicious activity
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MINUTES = 10;
const MAX_PURCHASES_PER_DAY = 20;
const SUSPICIOUS_PURCHASE_AMOUNT = 500000; // In VND or account currency

interface LoginAttempt {
  ip_address: string;
  user_agent: string;
  timestamp: Date;
  success: boolean;
  user_id?: string;
  email?: string;
}

interface PurchaseActivity {
  user_id: string;
  amount: number;
  product_id: string;
  timestamp: Date;
  ip_address: string;
  device_info: string;
}

// Track login attempts in memory (for short-term analysis)
// This will be reset when the server restarts, but that's acceptable
// as we also store persistent data in the database
const recentLoginAttempts: LoginAttempt[] = [];
const recentPurchaseActivity: PurchaseActivity[] = [];

// Helper functions
function getClientInfo() {
  return {
    ip_address: "unknown", // This will be updated server-side
    user_agent: navigator.userAgent,
    device_info: `${navigator.platform} - ${navigator.vendor}`
  };
}

/**
 * Record login attempt for fraud detection
 */
export async function recordLoginAttempt(
  email: string, 
  success: boolean, 
  userId?: string
) {
  const clientInfo = getClientInfo();
  
  // Add to in-memory collection for quick analysis
  const attemptData: LoginAttempt = {
    ip_address: clientInfo.ip_address,
    user_agent: clientInfo.user_agent,
    timestamp: new Date(),
    success,
    email,
    user_id: userId
  };
  
  recentLoginAttempts.push(attemptData);
  
  // Prune old attempts (older than 24 hours)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  while (
    recentLoginAttempts.length > 0 && 
    recentLoginAttempts[0].timestamp < yesterday
  ) {
    recentLoginAttempts.shift();
  }
  
  // Also record in database for long-term analysis
  try {
    await supabase.functions.invoke("fraud-detection", {
      body: {
        action: "record-login",
        data: {
          email,
          success,
          user_id: userId,
          ip_address: clientInfo.ip_address,
          user_agent: clientInfo.user_agent,
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error("Failed to record login attempt for fraud detection:", error);
  }
  
  // Check for suspicious login patterns
  return checkForSuspiciousLoginActivity(email);
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
  
  // Add to in-memory collection
  const purchaseData: PurchaseActivity = {
    user_id: userId,
    amount,
    product_id: productId,
    timestamp: new Date(),
    ip_address: clientInfo.ip_address,
    device_info: clientInfo.device_info
  };
  
  recentPurchaseActivity.push(purchaseData);
  
  // Prune old purchases (older than 24 hours)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  while (
    recentPurchaseActivity.length > 0 && 
    recentPurchaseActivity[0].timestamp < yesterday
  ) {
    recentPurchaseActivity.shift();
  }
  
  // Also record in database for long-term analysis
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
  
  // Check for suspicious purchase patterns
  return checkForSuspiciousPurchaseActivity(userId, amount);
}

/**
 * Check for suspicious login activity
 */
function checkForSuspiciousLoginActivity(email: string): boolean {
  // Filter for recent attempts for this email
  const recentAttempts = recentLoginAttempts.filter(attempt => 
    attempt.email === email &&
    attempt.timestamp > new Date(Date.now() - LOGIN_WINDOW_MINUTES * 60000)
  );
  
  // Check for too many failed attempts
  const failedAttempts = recentAttempts.filter(attempt => !attempt.success);
  if (failedAttempts.length >= MAX_LOGIN_ATTEMPTS) {
    console.warn(`Suspicious login activity detected for ${email}: ${failedAttempts.length} failed attempts in ${LOGIN_WINDOW_MINUTES} minutes`);
    return true;
  }
  
  // Check for logins from multiple countries or unusual locations
  // (In a real system, we would use the IP to determine location)
  const uniqueIps = new Set(recentAttempts.map(a => a.ip_address)).size;
  if (uniqueIps > 2 && recentAttempts.length > 3) {
    console.warn(`Suspicious login activity detected for ${email}: logins from ${uniqueIps} different IPs`);
    return true;
  }
  
  return false;
}

/**
 * Check for suspicious purchase activity
 */
function checkForSuspiciousPurchaseActivity(userId: string, amount: number): boolean {
  // Filter for recent purchases by this user
  const recentUserPurchases = recentPurchaseActivity.filter(purchase => 
    purchase.user_id === userId &&
    purchase.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
  );
  
  // Check for too many purchases in 24 hours
  if (recentUserPurchases.length > MAX_PURCHASES_PER_DAY) {
    console.warn(`Suspicious purchase activity: user ${userId} made ${recentUserPurchases.length} purchases in 24 hours`);
    return true;
  }
  
  // Check for unusually large purchases
  if (amount > SUSPICIOUS_PURCHASE_AMOUNT) {
    console.warn(`Suspicious purchase amount: user ${userId} attempted to purchase ${amount}`);
    return true;
  }
  
  // Check for rapid succession purchases
  if (recentUserPurchases.length >= 3) {
    const sortedPurchases = [...recentUserPurchases].sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );
    
    // Check if 3 purchases happened within 5 minutes
    const timeBetweenFirstAndLast = 
      sortedPurchases[sortedPurchases.length - 1].timestamp.getTime() - 
      sortedPurchases[sortedPurchases.length - 3].timestamp.getTime();
      
    if (timeBetweenFirstAndLast < 5 * 60 * 1000) { // 5 minutes in ms
      console.warn(`Suspicious rapid purchases: user ${userId} made 3 purchases in ${timeBetweenFirstAndLast / 1000} seconds`);
      return true;
    }
  }
  
  return false;
}

/**
 * Check if user's behavior deviates from their normal pattern
 * This would use machine learning in a production system
 */
export async function checkUserBehaviorAnomaly(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke("fraud-detection", {
      body: {
        action: "check-user-behavior",
        data: { user_id: userId }
      }
    });
    
    if (error) throw error;
    return data.suspicious;
  } catch (error) {
    console.error("Failed to check user behavior anomaly:", error);
    return false; // Fail open to avoid blocking legitimate users
  }
}
