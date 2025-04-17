
import { User } from 'lucide-react';

const UserButton = () => {
  return (
    <button className="p-1 text-text-light hover:text-primary transition-colors">
      <User className="h-6 w-6" />
    </button>
  );
};

export default UserButton;
