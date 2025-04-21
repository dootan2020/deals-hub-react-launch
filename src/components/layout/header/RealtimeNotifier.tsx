
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/context/AuthContext";

const RealtimeNotifier = () => {
  const { t } = useTranslation();
  const { userRoles } = useAuth();
  const isAdmin = userRoles.includes('admin');

  useEffect(() => {
    // Listen for general notifications
    const notificationsChannel = supabase.channel('public:notifications')
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        console.log("Realtime notification:", payload);
        
        // Check if notification is admin-only
        const notification = payload.new as { message: string; type: string; admin_only: boolean };
        if (notification.admin_only && !isAdmin) return;
        
        // Display appropriate toast based on notification type
        switch(notification.type) {
          case 'info':
            toast.info(notification.message || t("notification"));
            break;
          case 'warning':
            toast.warning(t("warning"), notification.message);
            break;
          case 'error':
            toast.error(t("error"), notification.message);
            break;
          case 'success':
            toast.success(t("success"), notification.message);
            break;
          default:
            toast.info(notification.message || t("notification"));
        }
      })
      .subscribe();
      
    // For admin users, also listen to system alerts from sync_logs
    let syncLogsChannel;
    if (isAdmin) {
      syncLogsChannel = supabase.channel('admin:sync_logs')
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "sync_logs" }, (payload) => {
          const log = payload.new as { status: string; message: string; action: string };
          
          if (log.status === 'error') {
            toast.error(`${log.action} Error`, log.message);
          } else if (log.status === 'warning') {
            toast.warning(`${log.action} Warning`, log.message);
          }
        })
        .subscribe();
    }

    return () => {
      supabase.removeChannel(notificationsChannel);
      if (syncLogsChannel) {
        supabase.removeChannel(syncLogsChannel);
      }
    };
  }, [t, isAdmin]);

  return null;
};

export default RealtimeNotifier;
