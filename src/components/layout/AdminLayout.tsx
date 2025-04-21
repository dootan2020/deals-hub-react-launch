
import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Settings, 
  BarChart3,
  FolderTree,
  Globe,
  Package,
  Users2,
  CreditCard,
  DollarSign,
  Database,
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const { pathname } = useLocation();
  
  const navItems: NavItem[] = [
    { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Categories', path: '/admin/categories', icon: <FolderTree className="w-5 h-5" /> },
    { label: 'Products', path: '/admin/products', icon: <Package className="w-5 h-5" /> },
    { label: 'Product Manager', path: '/admin/product-manager', icon: <Database className="w-5 h-5" /> },
    { label: 'Orders', path: '/admin/orders', icon: <ShoppingCart className="w-5 h-5" /> },
    { label: 'Transactions', path: '/admin/transactions', icon: <Wallet className="w-5 h-5" /> },
    { label: 'Users', path: '/admin/users', icon: <Users2 className="w-5 h-5" /> },
    { label: 'Site Settings', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
    { label: 'Currency Settings', path: '/admin/currency', icon: <DollarSign className="w-5 h-5" /> },
    { label: 'API Config', path: '/admin/api-config', icon: <Globe className="w-5 h-5" /> },
    { label: 'API Tester', path: '/admin/api-tester', icon: <Settings className="w-5 h-5" /> },
    { label: 'Proxy Settings', path: '/admin/proxy', icon: <Globe className="w-5 h-5" /> },
    { label: 'Sync Logs', path: '/admin/sync-logs', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <Link to="/" className="text-2xl font-bold">
            <span className="text-[#2ECC71]">Digital</span>
            <span className="text-[#3498DB]">Deals</span>
          </Link>
        </div>
        <nav className="p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  className={cn(
                    "flex items-center p-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors",
                    pathname === item.path && "bg-primary/10 text-primary font-medium"
                  )}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
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

export default AdminLayout;
