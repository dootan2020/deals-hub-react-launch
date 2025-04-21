
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { LoginAttempt } from "./types";

// Thresholds
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MINUTES = 10;

// In-memory storage (short-term only)
const recentLoginAttempts: LoginAttempt[] = [];

// Utilities
function getClientInfo() {
  return {
    ip_address: "unknown", // Will update server-side
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
  const attemptData: LoginAttempt = {
    ip_address: clientInfo.ip_address,
    user_agent: clientInfo.user_agent,
    timestamp: new Date(),
    success,
    email,
    user_id: userId
  };

  recentLoginAttempts.push(attemptData);

  // Prune old attempts (>24h)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  while (
    recentLoginAttempts.length > 0 &&
    recentLoginAttempts[0].timestamp < yesterday
  ) {
    recentLoginAttempts.shift();
  }

  // Record in DB
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
 * Check for suspicious login activity
 */
export function checkForSuspiciousLoginActivity(email: string): boolean {
  const recentAttempts = recentLoginAttempts.filter(attempt =>
    attempt.email === email &&
    attempt.timestamp > new Date(Date.now() - LOGIN_WINDOW_MINUTES * 60000)
  );

  const failedAttempts = recentAttempts.filter(attempt => !attempt.success);
  if (failedAttempts.length >= MAX_LOGIN_ATTEMPTS) {
    console.warn(`Suspicious login activity detected for ${email}: ${failedAttempts.length} failed attempts in ${LOGIN_WINDOW_MINUTES} minutes`);
    return true;
  }
  const uniqueIps = new Set(recentAttempts.map(a => a.ip_address)).size;
  if (uniqueIps > 2 && recentAttempts.length > 3) {
    console.warn(`Suspicious login activity detected for ${email}: logins from ${uniqueIps} different IPs`);
    return true;
  }
  return false;
}
