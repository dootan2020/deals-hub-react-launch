
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";

const RealtimeNotifier = () => {
  const { t } = useTranslation();

  useEffect(() => {
    // Lắng nghe table "notifications" (giả định) - bạn thay đổi cho phù hợp nếu cần
    const channel = supabase.channel('public:notifications')
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        console.log("Realtime notification:", payload);
        toast.info(t("notification"));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [t]);

  return null;
};

export default RealtimeNotifier;
