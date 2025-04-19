
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { WalletIcon, Bitcoin, CreditCard } from "lucide-react"
import { Link } from "react-router-dom"

const paymentMethods = [
  {
    id: 'binance',
    name: 'Ngân hàng (Binance)',
    icon: WalletIcon,
    path: '/deposit/binance'
  },
  {
    id: 'usdt',
    name: 'Crypto (USDT)',
    icon: Bitcoin,
    path: '/deposit/usdt'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: CreditCard,
    path: '/deposit/paypal'
  }
]

export function DepositOptions() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="hidden md:flex">
          <WalletIcon className="mr-2 h-4 w-4" />
          Nạp tiền
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[380px]">
        <SheetHeader className="mb-6">
          <SheetTitle>Chọn phương thức nạp tiền</SheetTitle>
        </SheetHeader>
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <Link
              key={method.id}
              to={method.path}
              className="flex items-center p-4 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <method.icon className="h-5 w-5 mr-3 text-muted-foreground" />
              <span className="font-medium">{method.name}</span>
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
