
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
    // Return an array of Route elements
    [
      /* Protected User Routes */
      <Route key="/dashboard" path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />,
      
      <Route key="/account" path="/account" element={
        <ProtectedRoute>
          <MyAccountPage />
        </ProtectedRoute>
      } />,
      
      <Route key="/deposit-history" path="/deposit-history" element={
        <ProtectedRoute>
          <DepositHistoryPage />
        </ProtectedRoute>
      } />,
      
      <Route key="/checkout/:slug" path="/checkout/:slug" element={
        <ProtectedRoute>
          <CheckoutPage />
        </ProtectedRoute>
      } />,
      
      /* Deposit Routes */
      <Route key="/page/deposit" path="/page/deposit" element={
        <ProtectedRoute>
          <DepositPage />
        </ProtectedRoute>
      } />,
      <Route key="/deposit" path="/deposit" element={
        <ProtectedRoute>
          <DepositPage />
        </ProtectedRoute>
      } />,
      <Route key="/top-up" path="/top-up" element={
        <ProtectedRoute>
          <DepositPage />
        </ProtectedRoute>
      } />,
      
      <Route key="/deposit/binance" path="/deposit/binance" element={
        <ProtectedRoute>
          <DepositPage method="binance" />
        </ProtectedRoute>
      } />,
      <Route key="/deposit/usdt" path="/deposit/usdt" element={
        <ProtectedRoute>
          <DepositPage method="usdt" />
        </ProtectedRoute>
      } />,
      <Route key="/deposit/paypal" path="/deposit/paypal" element={
        <ProtectedRoute>
          <PayPalDepositPage />
        </ProtectedRoute>
      } />,
      
      <Route key="/order-success" path="/order-success" element={
        <ProtectedRoute>
          <OrderSuccessPage />
        </ProtectedRoute>
      } />
    ]
  );
};

export default UserRoutes;
