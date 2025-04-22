
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/context/AuthContext";

const RealtimeNotifier = () => {
  const { t } = useTranslation();
  const { userRoles, user } = useAuth();
  const isAdmin = userRoles.includes('admin');
  const [channelStatus, setChannelStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    // Create a more robust notification channel with connection status tracking
    const notificationsChannel = supabase.channel('notifications-channel')
      .on('system', { event: 'reconnect' }, () => {
        console.log('Realtime system reconnect event');
        setChannelStatus(prev => ({...prev, notifications: 'RECONNECTING'}));
        toast({
          description: "Đang kết nối lại với máy chủ...",
        });
      })
      .on('system', { event: 'disconnect' }, () => {
        console.log('Realtime system disconnect event');
        setChannelStatus(prev => ({...prev, notifications: 'DISCONNECTED'}));
        toast.warning(t("connection_lost"), {
          description: t("reconnecting_in_progress"),
        });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        console.log("Realtime notification:", payload);

        // Get notification data from payload, verify permissions
        const notification = payload.new as { message: string; type: string; admin_only: boolean };
        if (notification.admin_only && !isAdmin) return;

        // Short title based on type
        let title = "";
        if (notification.type === 'info') title = t("notification");
        else if (notification.type === 'warning') title = t("warning");
        else if (notification.type === 'error') title = t("error");
        else if (notification.type === 'success') title = t("success");
        else title = t("notification");

        // Display mobile-friendly toast with translations
        switch (notification.type) {
          case 'info':
            toast(notification.message);
            break;
          case 'warning':
            toast.warning(notification.message);
            break;
          case 'error':
            toast.error(notification.message);
            break;
          case 'success':
            toast.success(notification.message);
            break;
          default:
            toast(notification.message);
        }
      })
      .subscribe((status) => {
        console.log("Notifications channel status:", status);
        setChannelStatus(prev => ({...prev, notifications: status}));
        
        // If subscription failed, inform the user
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          toast.warning(t("realtime_connection_issue"), {
            description: t("using_fallback_mechanism"),
          });
        }
      });

    // Listen to deposit status changes - separate channel for better reliability
    let depositsChannel;
    if (user?.id) {
      depositsChannel = supabase.channel('user-deposits-channel')
        .on('system', { event: 'reconnect' }, () => {
          console.log('Deposits channel reconnecting');
          setChannelStatus(prev => ({...prev, deposits: 'RECONNECTING'}));
        })
        .on('system', { event: 'disconnect' }, () => {
          console.log('Deposits channel disconnected');
          setChannelStatus(prev => ({...prev, deposits: 'DISCONNECTED'}));
        })
        .on("postgres_changes", 
            { event: "UPDATE", schema: "public", table: "deposits", filter: `user_id=eq.${user.id}` },
            (payload) => {
              const deposit = payload.new as { status: string; amount: number; transaction_id: string };
              const oldDeposit = payload.old as { status: string };
              console.log("Deposit status update:", deposit);
              
              // Only notify on status changes
              if (deposit.status !== oldDeposit.status) {
                if (deposit.status === 'completed') {
                  toast.success(t("deposit_completed", { amount: deposit.amount }));
                } else if (deposit.status === 'failed') {
                  toast.error(t("deposit_failed", { id: deposit.transaction_id }));
                }
              }
            })
        .subscribe((status) => {
          console.log("Deposits channel status:", status);
          setChannelStatus(prev => ({...prev, deposits: status}));
        });
    }

    // Admin-specific sync logs channel
    let syncLogsChannel;
    if (isAdmin) {
      syncLogsChannel = supabase.channel('admin-sync-logs-channel')
        .on('system', { event: 'reconnect' }, () => {
          console.log('Sync logs channel reconnecting');
          setChannelStatus(prev => ({...prev, syncLogs: 'RECONNECTING'}));
        })
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "sync_logs" }, (payload) => {
          const log = payload.new as { status: string; message: string; action: string };

          // Only show errors and warnings
          if (log.status === 'error') {
            toast.error(`${log.action}: ${log.message}`);
          } else if (log.status === 'warning') {
            toast.warning(`${log.action}: ${log.message}`);
          }
        })
        .subscribe((status) => {
          console.log("Sync logs channel status:", status);
          setChannelStatus(prev => ({...prev, syncLogs: status}));
        });
    }

    // Cleanup function
    return () => {
      console.log("Removing realtime channels");
      supabase.removeChannel(notificationsChannel);
      if (depositsChannel) {
        supabase.removeChannel(depositsChannel);
      }
      if (syncLogsChannel) {
        supabase.removeChannel(syncLogsChannel);
      }
    };
  }, [t, isAdmin, user?.id]);

  // Debug status to console periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log("Realtime channel statuses:", channelStatus);
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [channelStatus]);

  return null;
};

export default RealtimeNotifier;
