
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { User, CreditCard, Package, History } from 'lucide-react';

const mockOrders = [
  {
    id: 'ORD-1234',
    date: '2023-06-12',
    product: 'Gmail mới xác thực SĐT',
    amount: 55000,
    status: 'Hoàn thành'
  },
  {
    id: 'ORD-1235',
    date: '2023-06-10',
    product: 'Facebook BM có sẵn 2FA',
    amount: 450000,
    status: 'Hoàn thành'
  },
  {
    id: 'ORD-1236',
    date: '2023-06-08',
    product: 'Tool AI Writer Premium',
    amount: 230000,
    status: 'Hoàn thành'
  }
];

const DashboardPage: React.FC = () => {
  return (
    <Layout title="Tài khoản của tôi">
      <div className="bg-background-secondary py-8">
        <div className="container-custom">
          <h1 className="text-2xl font-bold mb-6">Tài khoản của tôi</h1>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* User Info Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-xl">Nguyen Van A</h2>
                  <p className="text-text-light">nguyenvana@example.com</p>
                </div>
              </div>
              
              <Button variant="outline" className="w-full" asChild>
                <a href="/account/profile">Chỉnh sửa thông tin</a>
              </Button>
            </div>
            
            {/* Balance Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">Số dư tài khoản</h2>
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              
              <p className="text-3xl font-bold text-primary mb-4">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(500000)}
              </p>
              
              <Button className="w-full" asChild>
                <a href="/deposit">Nạp tiền</a>
              </Button>
            </div>
            
            {/* Orders Summary Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">Đơn hàng gần đây</h2>
                <Package className="h-5 w-5 text-primary" />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Tổng đơn hàng:</span>
                  <span className="font-medium">7 đơn</span>
                </div>
                <div className="flex justify-between">
                  <span>Hoàn thành:</span>
                  <span className="font-medium text-green-600">6 đơn</span>
                </div>
                <div className="flex justify-between">
                  <span>Đang xử lý:</span>
                  <span className="font-medium text-blue-600">1 đơn</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order History */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <History className="h-5 w-5 text-primary mr-2" />
                  <h2 className="font-semibold text-lg">Lịch sử đơn hàng</h2>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="/account/orders">Xem tất cả</a>
                </Button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã đơn hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày mua
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sản phẩm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.product}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(order.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <a href={`/account/orders/${order.id}`} className="text-primary hover:text-primary-dark">
                          Chi tiết
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
