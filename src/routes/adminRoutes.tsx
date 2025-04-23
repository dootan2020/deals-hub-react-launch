
import { Route } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { UserRole } from "@/types/auth.types";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminTransactions from "@/pages/admin/AdminTransactions";

// Admin routes with role protection
export const adminRoutes = (
  <>
    <Route
      path="/admin"
      element={
        <RoleGuard requiredRoles={[UserRole.Admin]} redirectPath="/unauthorized">
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </RoleGuard>
      }
    />
    <Route
      path="/admin/products"
      element={
        <RoleGuard requiredRoles={[UserRole.Admin]} redirectPath="/unauthorized">
          <AdminLayout title="Quản lý sản phẩm">
            <AdminProducts />
          </AdminLayout>
        </RoleGuard>
      }
    />
    <Route
      path="/admin/orders"
      element={
        <RoleGuard requiredRoles={[UserRole.Admin]} redirectPath="/unauthorized">
          <AdminLayout title="Quản lý đơn hàng">
            <AdminOrders />
          </AdminLayout>
        </RoleGuard>
      }
    />
    <Route
      path="/admin/users"
      element={
        <RoleGuard requiredRoles={[UserRole.Admin]} redirectPath="/unauthorized">
          <AdminLayout title="Quản lý người dùng">
            <AdminUsers />
          </AdminLayout>
        </RoleGuard>
      }
    />
    <Route
      path="/admin/transactions"
      element={
        <RoleGuard requiredRoles={[UserRole.Admin]} redirectPath="/unauthorized">
          <AdminLayout title="Quản lý giao dịch">
            <AdminTransactions />
          </AdminLayout>
        </RoleGuard>
      }
    />
  </>
);
