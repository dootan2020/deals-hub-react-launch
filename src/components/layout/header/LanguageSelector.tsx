
import { Globe } from 'lucide-react';
import { useLanguage } from "@/context/LanguageContext";

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="hidden md:flex items-center">
      <Globe className="h-5 w-5 text-text-light" />
      <select
        className="ml-1 text-sm text-text-light bg-transparent border-none focus:outline-none"
        value={language}
        onChange={(e) => setLanguage(e.target.value as any)}
        aria-label="Select language"
      >
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="vi">Vietnamese</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
