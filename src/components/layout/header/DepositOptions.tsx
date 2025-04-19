
import { Button } from "@/components/ui/button"
import { WalletIcon } from "lucide-react"
import { Link } from "react-router-dom"

export function DepositOptions() {
  return (
    <Button variant="outline" size="sm" className="hidden md:flex" asChild>
      <Link to="/deposit">
        <WalletIcon className="mr-2 h-4 w-4" />
        Nạp tiền
      </Link>
    </Button>
  )
}
