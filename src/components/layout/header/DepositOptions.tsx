
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { WalletIcon, History } from "lucide-react";
import { Link } from "react-router-dom";

export function DepositOptions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="default" 
          size="sm" 
          className="hidden md:flex bg-gradient-to-r from-primary to-primary-dark hover:opacity-90 transition-all duration-150"
        >
          <WalletIcon className="mr-2 h-4 w-4" />
          Nạp tiền
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild className="p-0">
          <Link to="/deposit" className="w-full px-4 py-2 cursor-pointer flex items-center">
            <WalletIcon className="mr-2 h-4 w-4" />
            Nạp tiền
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="p-0">
          <Link to="/deposit-history" className="w-full px-4 py-2 cursor-pointer flex items-center">
            <History className="mr-2 h-4 w-4" />
            Lịch sử nạp tiền
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
