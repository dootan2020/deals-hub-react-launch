
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

interface DepositPackage {
  id: string;
  amount: number;
  bonus: number;
  price: number;
}

const depositPackages: DepositPackage[] = [
  { id: '1', amount: 100000, bonus: 0, price: 100000 },
  { id: '2', amount: 200000, bonus: 10000, price: 200000 },
  { id: '3', amount: 500000, bonus: 25000, price: 500000 },
  { id: '4', amount: 1000000, bonus: 75000, price: 1000000 },
  { id: '5', amount: 2000000, bonus: 200000, price: 2000000 },
];

const DepositPage: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState<DepositPackage | null>(null);
  
  const handleDeposit = () => {
    if (!selectedPackage) return;
    console.log('Processing deposit for package:', selectedPackage);
    // Placeholder for deposit logic
    alert(`Đã khởi tạo giao dịch nạp ${selectedPackage.amount.toLocaleString('vi-VN')}đ`);
  };
  
  return (
    <Layout title="Nạp tiền">
      <div className="bg-background-secondary py-8">
        <div className="container-custom">
          <h1 className="text-2xl font-bold mb-6">Nạp tiền vào tài khoản</h1>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Deposit packages */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Chọn gói nạp</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {depositPackages.map((pkg) => (
                    <div 
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedPackage?.id === pkg.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Gói nạp</span>
                        {pkg.bonus > 0 && (
                          <span className="badge-green">
                            +{pkg.bonus.toLocaleString('vi-VN')}đ
                          </span>
                        )}
                      </div>
                      
                      <div className="text-xl font-bold text-primary">
                        {pkg.amount.toLocaleString('vi-VN')}đ
                      </div>
                      
                      {pkg.bonus > 0 && (
                        <div className="text-sm text-text-light mt-1">
                          Tổng nhận: {(pkg.amount + pkg.bonus).toLocaleString('vi-VN')}đ
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Phương thức thanh toán</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="border border-primary rounded-lg p-4 flex flex-col items-center justify-center text-center">
                    <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg" alt="PayPal" className="h-10 mb-2" />
                    <span className="font-medium">PayPal</span>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center text-center opacity-50">
                    <img src="https://placehold.co/200x60?text=Bank+Transfer" alt="Bank Transfer" className="h-10 mb-2" />
                    <span className="font-medium">Chuyển khoản</span>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center text-center opacity-50">
                    <img src="https://placehold.co/200x60?text=Crypto" alt="Crypto" className="h-10 mb-2" />
                    <span className="font-medium">Crypto</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  disabled={!selectedPackage}
                  onClick={handleDeposit}
                >
                  Tiếp tục
                </Button>
              </div>
            </div>
            
            {/* Deposit summary */}
            <div>
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-semibold mb-4">Thông tin giao dịch</h2>
                
                {selectedPackage ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Gói nạp:</span>
                      <span className="font-medium">
                        {selectedPackage.amount.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    
                    {selectedPackage.bonus > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Khuyến mãi:</span>
                        <span className="font-medium">
                          +{selectedPackage.bonus.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between border-t pt-2 text-lg">
                      <span className="font-medium">Tổng nhận:</span>
                      <span className="font-bold text-primary">
                        {(selectedPackage.amount + selectedPackage.bonus).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    
                    <div className="flex justify-between border-t pt-2">
                      <span>Thanh toán:</span>
                      <span className="font-medium">
                        {selectedPackage.price.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    
                    <div className="mt-4 pt-2 text-sm text-text-light">
                      <p>
                        Nạp tiền thành công sẽ được cộng vào số dư ngay lập tức. Sử dụng số dư để mua các sản phẩm trên hệ thống.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-text-light">
                    Vui lòng chọn gói nạp
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DepositPage;
