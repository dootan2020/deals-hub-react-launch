
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if user's behavior deviates from their normal pattern
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
    return false;
  }
}
