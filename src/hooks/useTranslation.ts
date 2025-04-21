
import { useLanguage } from "@/context/LanguageContext";

const translations = {
  en: {
    welcome: "Welcome",
    notification: "You have a new notification!",
  },
  vi: {
    welcome: "Chào mừng",
    notification: "Bạn có thông báo mới!",
  },
  es: {
    welcome: "Bienvenido",
    notification: "¡Tienes una nueva notificación!",
  },
};

export function useTranslation() {
  const { language } = useLanguage();

  function t(key: keyof typeof translations["en"]) {
    return translations[language][key] || translations["en"][key] || key;
  }

  return { t, language };
}
