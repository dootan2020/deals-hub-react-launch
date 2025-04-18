
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
} from "lucide-react";
import { Link } from "react-router-dom";
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
  const { user, logout, isAuthenticated, userBalance } = useAuth();

  if (!isAuthenticated) {
    return (
      <Link to="/login">
        <Button variant="outline" size="sm" className="ml-4">
          <LogIn className="mr-2 h-4 w-4" />
          Đăng nhập
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
        <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
        <DropdownMenuItem className="flex justify-between">
          <span>Số dư:</span>
          <span className="font-medium text-primary">
            {formatCurrency(userBalance)}
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <Link to="/top-up">
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Nạp tiền</span>
          </DropdownMenuItem>
        </Link>
        <Link to="/orders">
          <DropdownMenuItem>
            <FileText className="mr-2 h-4 w-4" />
            <span>Đơn hàng</span>
          </DropdownMenuItem>
        </Link>
        <Link to="/settings">
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Cài đặt</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
