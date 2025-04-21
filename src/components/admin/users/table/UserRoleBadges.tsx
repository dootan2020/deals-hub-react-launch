
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types/auth.types';
import { Trash2, ShieldAlert, Shield, User } from 'lucide-react';

interface UserRoleBadgesProps {
  roles?: UserRole[];
  onRemoveRole: (role: UserRole) => void;
}

export const UserRoleBadges = ({ roles, onRemoveRole }: UserRoleBadgesProps) => {
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-red-500 hover:bg-red-600';
      case 'staff': return 'bg-blue-500 hover:bg-blue-600';
      case 'user': return 'bg-green-500 hover:bg-green-600';
      case 'guest': return 'bg-gray-500 hover:bg-gray-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return <ShieldAlert className="h-3 w-3 mr-1" />;
      case 'staff': return <Shield className="h-3 w-3 mr-1" />;
      case 'user': return <User className="h-3 w-3 mr-1" />;
      case 'guest': return <User className="h-3 w-3 mr-1" />;
      default: return <User className="h-3 w-3 mr-1" />;
    }
  };

  return (
    <div className="flex flex-wrap gap-1">
      {roles && roles.map(role => (
        <Badge 
          key={role} 
          variant="secondary"
          className={`flex items-center gap-1 text-white ${getRoleBadgeColor(role)}`}
        >
          {getRoleIcon(role)}
          {role}
          <button 
            onClick={() => onRemoveRole(role)}
            className="ml-1 rounded-full hover:bg-red-700 p-0.5"
            aria-label={`Xóa vai trò ${role}`}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {(!roles || roles.length === 0) && (
        <span className="text-gray-500 italic">Chưa có vai trò</span>
      )}
    </div>
  );
};
