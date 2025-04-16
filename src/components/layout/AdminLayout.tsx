import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package2, 
  ShoppingCart, 
  Settings, 
  BarChart3,
  FolderTree
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
          <Link to="/" className="text-2xl font-bold text-primary">
            Digital Deals
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
                to="/admin/products" 
                className="flex items-center p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <Package2 className="w-5 h-5 mr-2" />
                Products
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
                to="/admin/api-config" 
                className="flex items-center p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <Settings className="w-5 h-5 mr-2" />
                API Config
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
            <li>
              <Link 
                to="/admin/proxy-settings" 
                className="flex items-center p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <Settings className="w-5 h-5 mr-2" />
                CORS Proxy Settings
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
