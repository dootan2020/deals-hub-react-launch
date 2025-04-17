
import { Globe } from 'lucide-react';

const LanguageSelector = () => {
  return (
    <div className="hidden md:flex items-center">
      <Globe className="h-5 w-5 text-text-light" />
      <select className="ml-1 text-sm text-text-light bg-transparent border-none focus:outline-none">
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="pt">Portuguese</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
