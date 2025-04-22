
import { useToast } from "@/hooks/use-toast";

type PurchaseStatus = "idle" | "loading" | "success" | "error";

interface UsePurchaseToastReturn {
  notifyLoading: (msg?: string) => void;
  notifySuccess: (msg?: string, desc?: string) => void;
  notifyError: (msg?: string, desc?: string) => void;
  handleApiError: (err: any, fallbackMsg?: string) => void;
  status: PurchaseStatus;
  setStatus: React.Dispatch<React.SetStateAction<PurchaseStatus>>;
}

import { useState, useCallback } from "react";

export function usePurchaseToast(): UsePurchaseToastReturn {
  const { toast } = useToast();
  const [status, setStatus] = useState<PurchaseStatus>("idle");

  const notifyLoading = useCallback((msg?: string) => {
    setStatus("loading");
    toast.loading(msg || "Đang xử lý đơn hàng...");
  }, [toast]);

  const notifySuccess = useCallback((msg?: string, desc?: string) => {
    setStatus("success");
    toast.success(msg || "Mua thành công", desc);
  }, [toast]);

  const notifyError = useCallback((msg?: string, desc?: string) => {
    setStatus("error");
    toast.error(msg || "Không thể tạo đơn hàng", desc);
  }, [toast]);

  // Xử lý lỗi từ API, fallback ra toast.error
  const handleApiError = useCallback((err: any, fallbackMsg?: string) => {
    setStatus("error");
    const msg = typeof err === "string"
      ? err
      : (err?.message || err?.description || fallbackMsg || "Có lỗi xảy ra khi tạo đơn hàng");
    toast.error("Không thể tạo đơn hàng", msg);
  }, [toast]);

  return {
    notifyLoading,
    notifySuccess,
    notifyError,
    handleApiError,
    status,
    setStatus
  };
}
