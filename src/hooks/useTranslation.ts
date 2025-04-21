
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
  },
};

export function useTranslation() {
  const { language } = useLanguage();

  function t(key: keyof typeof translations["en"]) {
    return translations[language][key] || translations["en"][key] || key;
  }

  return { t, language };
}
