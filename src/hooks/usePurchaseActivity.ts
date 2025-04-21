
import { supabase } from '@/integrations/supabase/client';
import { recordPurchaseActivity, checkUserBehaviorAnomaly } from '@/utils/fraud-detection';

export async function logOrderActivity({
  orderId,
  userId,
  action,
  oldStatus,
  newStatus,
  metadata,
}: {
  orderId: string;
  userId: string | null;
  action: string;
  oldStatus?: string;
  newStatus?: string;
  metadata?: any;
}) {
  try {
    await supabase.from('order_activities').insert([{
      order_id: orderId,
      user_id: userId,
      action,
      old_status: oldStatus,
      new_status: newStatus,
      metadata,
    }]);
  } catch (error) {
    // Optionally log to Sentry
    console.error('Failed to log order activity:', error);
  }
}

// Wrap fraud detection and anomaly checking together
export async function checkFraudAndReport(userId: string, totalAmount: number, productId: string) {
  const isSuspicious = await recordPurchaseActivity(userId, totalAmount, productId);
  if (isSuspicious) {
    const behaviorAnomaly = await checkUserBehaviorAnomaly(userId);
    if (behaviorAnomaly) {
      return true;
    }
  }
  return false;
}
