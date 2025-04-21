
import { useLanguage } from "@/context/LanguageContext";

const translations = {
  en: {
    welcome: "Welcome",
    notification: "You have a new notification!",
    warning: "Warning",
    error: "Error",
    success: "Success",
    systemAlert: "System Alert",
    lowStockAlert: "Low Stock Alert",
    outOfStockAlert: "Out of Stock Alert",
    syncError: "Sync Error",
    payment_successful: "Payment Successful",
    payment_failed: "Payment Failed",
    deposit_completed: "Your deposit of ${{amount}} has been completed",
    deposit_failed: "Your deposit #{{id}} has failed",
  },
  vi: {
    welcome: "Chào mừng",
    notification: "Bạn có thông báo mới!",
    warning: "Cảnh báo",
    error: "Lỗi",
    success: "Thành công",
    systemAlert: "Cảnh báo hệ thống",
    lowStockAlert: "Cảnh báo hàng tồn kho thấp",
    outOfStockAlert: "Cảnh báo hết hàng",
    syncError: "Lỗi đồng bộ",
    payment_successful: "Thanh toán thành công",
    payment_failed: "Thanh toán thất bại",
    deposit_completed: "Nạp tiền ${{amount}} đã hoàn tất",
    deposit_failed: "Giao dịch nạp tiền #{{id}} thất bại",
  },
  es: {
    welcome: "Bienvenido",
    notification: "¡Tienes una nueva notificación!",
    warning: "Advertencia",
    error: "Error",
    success: "Éxito",
    systemAlert: "Alerta del Sistema",
    lowStockAlert: "Alerta de Inventario Bajo",
    outOfStockAlert: "Alerta de Agotamiento",
    syncError: "Error de Sincronización",
    payment_successful: "Pago exitoso",
    payment_failed: "Pago fallido",
    deposit_completed: "Su depósito de ${{amount}} ha sido completado",
    deposit_failed: "Su depósito #{{id}} ha fallado",
  },
};

export function useTranslation() {
  const { language } = useLanguage();

  function t(key: keyof typeof translations["en"], params?: Record<string, string | number>) {
    let text = translations[language][key] || translations["en"][key] || key;
    
    // Replace parameters if provided
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        text = text.replace(`{{${key}}}`, String(value));
      });
    }
    
    return text;
  }

  return { t, language };
}
