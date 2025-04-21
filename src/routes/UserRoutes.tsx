
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// User pages
import DashboardPage from "@/pages/user/DashboardPage";
import MyAccountPage from "@/pages/user/MyAccountPage";
import OrderSuccessPage from "@/pages/OrderSuccessPage";
import DepositPage from "@/pages/DepositPage";
import PayPalDepositPage from "@/pages/PayPalDepositPage";
import DepositHistoryPage from "@/pages/DepositHistoryPage";
import CheckoutPage from "@/pages/CheckoutPage";

const UserRoutes = () => {
  return (
    <>
      {/* Protected User Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      
      <Route path="/account" element={
        <ProtectedRoute>
          <MyAccountPage />
        </ProtectedRoute>
      } />
      
      <Route path="/deposit-history" element={
        <ProtectedRoute>
          <DepositHistoryPage />
        </ProtectedRoute>
      } />
      
      <Route path="/checkout/:slug" element={
        <ProtectedRoute>
          <CheckoutPage />
        </ProtectedRoute>
      } />
      
      {/* Deposit Routes */}
      <Route path="/page/deposit" element={
        <ProtectedRoute>
          <DepositPage />
        </ProtectedRoute>
      } />
      <Route path="/deposit" element={
        <ProtectedRoute>
          <DepositPage />
        </ProtectedRoute>
      } />
      <Route path="/top-up" element={
        <ProtectedRoute>
          <DepositPage />
        </ProtectedRoute>
      } />
      
      <Route path="/deposit/binance" element={
        <ProtectedRoute>
          <DepositPage method="binance" />
        </ProtectedRoute>
      } />
      <Route path="/deposit/usdt" element={
        <ProtectedRoute>
          <DepositPage method="usdt" />
        </ProtectedRoute>
      } />
      <Route path="/deposit/paypal" element={
        <ProtectedRoute>
          <PayPalDepositPage />
        </ProtectedRoute>
      } />
      
      <Route path="/order-success" element={
        <ProtectedRoute>
          <OrderSuccessPage />
        </ProtectedRoute>
      } />
    </>
  );
};

export default UserRoutes;
