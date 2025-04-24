
import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User, CreditCard, Home, Package, Info, Phone } from 'lucide-react';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileNavigation = ({ isOpen, onClose }: MobileNavigationProps) => {
  const { isAuthenticated, logout, user } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="md:hidden bg-white border-t border-gray-100 fixed left-0 right-0 top-16 z-50 shadow-lg"
        >
          <div className="py-2">
            {/* Main navigation links */}
            <Link to="/" onClick={onClose} className="flex items-center px-6 py-3 hover:bg-gray-50">
              <Home size={18} className="mr-3 text-primary" />
              <span>Trang chủ</span>
            </Link>
            
            <Link to="/products" onClick={onClose} className="flex items-center px-6 py-3 hover:bg-gray-50">
              <Package size={18} className="mr-3 text-primary" />
              <span>Sản phẩm</span>
            </Link>
            
            <Link to="/about" onClick={onClose} className="flex items-center px-6 py-3 hover:bg-gray-50">
              <Info size={18} className="mr-3 text-primary" />
              <span>Giới thiệu</span>
            </Link>
            
            <Link to="/contact" onClick={onClose} className="flex items-center px-6 py-3 hover:bg-gray-50">
              <Phone size={18} className="mr-3 text-primary" />
              <span>Liên hệ</span>
            </Link>
            
            {/* Auth related links */}
            {isAuthenticated ? (
              <>
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <Link to="/dashboard" onClick={onClose} className="flex items-center px-6 py-3 hover:bg-gray-50">
                    <User size={18} className="mr-3 text-primary" />
                    <span>Tài khoản</span>
                  </Link>
                  
                  <Link to="/deposit" onClick={onClose} className="flex items-center px-6 py-3 hover:bg-gray-50">
                    <CreditCard size={18} className="mr-3 text-primary" />
                    <span>Nạp tiền</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center px-6 py-3 hover:bg-gray-50 text-red-600"
                  >
                    <LogOut size={18} className="mr-3" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-gray-100 mt-2 pt-2">
                <Link to="/login" onClick={onClose} className="flex items-center px-6 py-3 hover:bg-gray-50">
                  <User size={18} className="mr-3 text-primary" />
                  <span>Đăng nhập</span>
                </Link>
                <Link to="/register" onClick={onClose} className="flex items-center px-6 py-3 hover:bg-gray-50 font-medium text-primary">
                  <span>Đăng ký</span>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileNavigation;
