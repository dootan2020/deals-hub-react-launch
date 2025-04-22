
import React, { useEffect, useState } from "react";
import { Bell, AlertTriangle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { isOrder, isValidArray } from "@/utils/supabaseHelpers";

interface NewOrder {
  id: string;
  user_id: string;
  created_at: string;
  status: string;
  external_order_id?: string;
  total_price: number;
}

export const NotificationBell: React.FC = () => {
  const [orders, setOrders] = useState<NewOrder[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNewOrders();
    const interval = setInterval(() => {
      fetchNewOrders();
    }, 15_000);

    return () => clearInterval(interval);
  }, []);

  async function fetchNewOrders() {
    setLoading(true);
    setError(null);
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    try {
      const { data, error: depositsError } = await supabase
        .from("orders")
        .select("id,user_id,created_at,status,external_order_id,total_price")
        .gte("created_at", since)
        .order("created_at", { ascending: false });

      if (depositsError) {
        setError("Không thể lấy đơn hàng mới");
        setLoading(false);
        return;
      }

      const validOrders: NewOrder[] = [];
      if (isValidArray(data)) {
        data.forEach(item => {
          if (isOrder(item)) {
            validOrders.push({
              id: String(item.id),
              user_id: String(item.user_id),
              created_at: String(item.created_at),
              status: String(item.status),
              external_order_id: item.external_order_id ? String(item.external_order_id) : undefined,
              total_price: typeof item.total_price === 'number' ? item.total_price : parseFloat(String(item.total_price) || '0')
            });
          }
        });
      }
      setOrders(validOrders);
    } catch (err) {
      setError("Đã xảy ra lỗi khi tải đơn hàng");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Thông báo đơn mới"
          className={cn(
            "relative p-2 rounded-full hover:bg-gray-100 focus:outline-none transition-colors",
            orders.length > 0 && "text-green-600"
          )}
        >
          <Bell className="w-6 h-6" />
          {orders.length > 0 && (
            <span className="absolute top-1 right-1 inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-4 py-2 border-b font-semibold">
          Đơn hàng mới 24h
        </div>
        <div className="max-h-56 overflow-y-auto">
          {loading && (
            <div className="flex items-center gap-2 p-3 text-muted-foreground">
              <AlertTriangle className="w-4 h-4 animate-spin" /> Đang tải...
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 p-3 text-destructive">
              <AlertTriangle className="w-4 h-4" /> {error}
            </div>
          )}
          {!loading && orders.length === 0 && (
            <div className="p-3 text-muted-foreground text-sm">
              Không có đơn hàng mới trong 24h.
            </div>
          )}
          {!loading &&
            orders.map((order) => (
              <div key={order.id} className={cn(
                "p-3 border-b last:border-b-0 flex flex-col gap-1",
                order.status === "completed" ? "bg-green-50" : "bg-yellow-50"
              )}>
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    Đơn #{order.external_order_id || order.id.slice(0,8)}
                  </span>
                  {order.status === "completed" ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Thời gian: {new Date(order.created_at).toLocaleString("vi-VN")}
                </div>
                <div className="text-xs text-muted-foreground">
                  Tổng: {order.total_price?.toLocaleString()} VND
                </div>
                <div className="text-xs">
                  Trạng thái:{" "}
                  <span className={order.status === "completed" ? "text-green-700" : "text-yellow-700"}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
