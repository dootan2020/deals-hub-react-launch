
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { WalletIcon, History } from "lucide-react";
import { Link } from "react-router-dom";

export function DepositOptions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="hidden md:flex">
          <WalletIcon className="mr-2 h-4 w-4" />
          Nạp tiền
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/deposit" className="w-full cursor-pointer">
            <WalletIcon className="mr-2 h-4 w-4" />
            Nạp tiền
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/deposit-history" className="w-full cursor-pointer">
            <History className="mr-2 h-4 w-4" />
            Lịch sử nạp tiền
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
