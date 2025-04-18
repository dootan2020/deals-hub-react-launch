
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Wallet,
  User,
  Heart,
  Clock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface UserLayoutProps {
  children: ReactNode;
  title: string;
}

const UserLayout = ({ children, title }: UserLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <Link to="/" className="text-2xl font-bold">
            <span className="text-[#1A936F]">Acc</span>
            <span className="text-[#1A936F]">Zen.net</span>
          </Link>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link 
                to="/dashboard" 
                className="flex items-center p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <LayoutDashboard className="w-5 h-5 mr-2" />
                Bảng điều khiển
              </Link>
            </li>
            <li>
              <Link 
                to="/my-orders" 
                className="flex items-center p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Đơn hàng của tôi
              </Link>
            </li>
            <li>
              <Link 
                to="/deposit" 
                className="flex items-center p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <Wallet className="w-5 h-5 mr-2" />
                Nạp tiền
              </Link>
            </li>
            <li>
              <Link 
                to="/wishlist" 
                className="flex items-center p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <Heart className="w-5 h-5 mr-2" />
                Danh sách yêu thích
              </Link>
            </li>
            <li>
              <Link 
                to="/purchase-history" 
                className="flex items-center p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <Clock className="w-5 h-5 mr-2" />
                Lịch sử mua hàng
              </Link>
            </li>
            <li>
              <Link 
                to="/profile" 
                className="flex items-center p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <User className="w-5 h-5 mr-2" />
                Thông tin cá nhân
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow">
          <div className="px-4 py-6 mx-auto">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
