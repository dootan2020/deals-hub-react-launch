
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/context/AuthContext";

const RealtimeNotifier = () => {
  const { t } = useTranslation();
  const { userRoles, user } = useAuth();
  const isAdmin = userRoles.includes('admin');

  useEffect(() => {
    // Channel thông báo chung
    const notificationsChannel = supabase.channel('public:notifications')
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        console.log("Realtime notification:", payload);

        // Lấy dữ liệu notification từ payload, xác thực quyền
        const notification = payload.new as { message: string; type: string; admin_only: boolean };
        if (notification.admin_only && !isAdmin) return;

        // Tiêu đề ngắn theo loại
        let title = "";
        if (notification.type === 'info') title = t("notification");
        else if (notification.type === 'warning') title = t("warning");
        else if (notification.type === 'error') title = t("error");
        else if (notification.type === 'success') title = t("success");
        else title = t("notification");

        // Hiển thị toast thân thiện mobile, có đa ngữ
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
      .subscribe();

    // Listen to deposit status changes
    let depositsChannel;
    if (user?.id) {
      depositsChannel = supabase.channel('user:deposits')
        .on("postgres_changes", 
            { event: "UPDATE", schema: "public", table: "deposits", filter: `user_id=eq.${user.id}` },
            (payload) => {
              const deposit = payload.new as { status: string; amount: number; transaction_id: string };
              console.log("Deposit status update:", deposit);
              
              if (deposit.status === 'completed') {
                toast.success(t("deposit_completed", { amount: deposit.amount }));
              } else if (deposit.status === 'failed') {
                toast.error(t("deposit_failed", { id: deposit.transaction_id }));
              }
            })
        .subscribe();
    }

    // Nếu là admin, lắng nghe thêm hệ thống sync_logs
    let syncLogsChannel;
    if (isAdmin) {
      syncLogsChannel = supabase.channel('admin:sync_logs')
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "sync_logs" }, (payload) => {
          const log = payload.new as { status: string; message: string; action: string };

          let title = "";
          if (log.status === 'error') title = `${log.action} ${t("error")}`;
          else if (log.status === 'warning') title = `${log.action} ${t("warning")}`;
          else title = log.action;

          if (log.status === 'error') {
            toast.error(log.message);
          } else if (log.status === 'warning') {
            toast.warning(log.message);
          }
        })
        .subscribe();
    }

    return () => {
      supabase.removeChannel(notificationsChannel);
      if (depositsChannel) {
        supabase.removeChannel(depositsChannel);
      }
      if (syncLogsChannel) {
        supabase.removeChannel(syncLogsChannel);
      }
    };
  }, [t, isAdmin, user]);

  return null;
};

export default RealtimeNotifier;
