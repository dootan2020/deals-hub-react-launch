
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  LogIn,
  LogOut,
  User,
  CreditCard,
  FileText,
  Settings,
  ChevronDown,
  Lock,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";

export const UserButton = () => {
  const { user, logout, isAuthenticated, isAdmin, userBalance } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <Link to="/login">
        <Button variant="outline" size="sm" className="ml-4">
          <LogIn className="mr-2 h-4 w-4" />
          Login
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <User className="mr-2 h-4 w-4" />
          <span className="hidden md:inline-block">
            {user?.email?.split('@')[0]}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 text-text-light" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuItem className="flex justify-between">
          <span>Balance:</span>
          <span className="font-medium text-primary">
            {formatCurrency(userBalance)}
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <Link to="/account">
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>My Account</span>
          </DropdownMenuItem>
        </Link>
        <Link to="/top-up">
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Deposit</span>
          </DropdownMenuItem>
        </Link>
        <Link to="/orders">
          <DropdownMenuItem>
            <FileText className="mr-2 h-4 w-4" />
            <span>Orders</span>
          </DropdownMenuItem>
        </Link>
        <Link to="/account?tab=password">
          <DropdownMenuItem>
            <Lock className="mr-2 h-4 w-4" />
            <span>Change Password</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
