
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  LogIn,
  LogOut,
  User,
  CreditCard,
  FileText
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
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const UserButton = () => {
  const { user, logout, isAuthenticated, userBalance, refreshUserBalance, isLoadingBalance } = useAuth();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Đăng xuất thành công", "Hẹn gặp lại bạn!");
      navigate('/login');
    } catch (error) {
      toast.error("Đăng xuất thất bại", "Vui lòng thử lại");
      console.error("Logout error:", error);
    }
  };
  
  const handleRefreshBalance = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await refreshUserBalance();
      toast.success("Số dư đã được cập nhật");
    } catch (error) {
      toast.error("Không thể cập nhật số dư");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Link to="/login">
        <Button variant="outline" size="sm" className="hover:bg-primary hover:text-white transition-all duration-150">
          <LogIn className="mr-2 h-4 w-4" />
          <span className="hidden md:inline">Đăng nhập / Đăng ký</span>
          <span className="md:hidden">Đăng nhập</span>
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative hover:bg-accent/10">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
        <DropdownMenuItem className="flex justify-between" onClick={(e) => e.preventDefault()}>
          <span>Số dư:</span>
          <div className="flex items-center">
            <span className="font-medium text-primary mr-2">
              {isLoadingBalance ? "Đang tải..." : formatCurrency(userBalance)}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-4 w-4 p-0" 
              onClick={handleRefreshBalance}
            >
              <CreditCard className={`h-3 w-3 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <Link to="/account">
          <DropdownMenuItem className="hover:bg-accent/10 hover:text-primary">
            <User className="mr-2 h-4 w-4" />
            <span>Thông tin cá nhân</span>
          </DropdownMenuItem>
        </Link>
        <Link to="/orders">
          <DropdownMenuItem className="hover:bg-accent/10 hover:text-primary">
            <FileText className="mr-2 h-4 w-4" />
            <span>Lịch sử giao dịch</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="hover:bg-accent/10 hover:text-primary">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
