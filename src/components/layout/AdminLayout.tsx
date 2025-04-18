
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Settings, 
  BarChart3,
  FolderTree,
  Globe,
  Package,
  Users2
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
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
                to="/admin" 
                className="flex items-center p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <LayoutDashboard className="w-5 h-5 mr-2" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/categories" 
                className="flex items-center p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <FolderTree className="w-5 h-5 mr-2" />
                Categories
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/product-manager" 
                className="flex items-center p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <Package className="w-5 h-5 mr-2" />
                Product Manager
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/orders" 
                className="flex items-center p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Orders
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/users" 
                className="flex items-center p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <Users2 className="w-5 h-5 mr-2" />
                User Management
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/api-config" 
                className="flex items-center p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <Settings className="w-5 h-5 mr-2" />
                API Config
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/api-tester" 
                className="flex items-center p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <Globe className="w-5 h-5 mr-2" />
                API Tester
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/sync-logs" 
                className="flex items-center p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Sync Logs
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

export default AdminLayout;
