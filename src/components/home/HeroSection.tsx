
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-b from-primary/5 to-white py-16 md:py-24">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Tài khoản số <span className="text-primary">chất lượng cao</span> với giá tốt nhất
          </h1>
          
          <p className="text-xl text-text-light mb-8">
            Cung cấp tài khoản Gmail, Facebook, công cụ AI và nhiều sản phẩm số khác. Giao hàng tự động, bảo hành 1-1.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/products">
              <Button size="lg" className="gap-2 px-8">
                Xem sản phẩm
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            
            <Link to="/register">
              <Button variant="outline" size="lg">
                Đăng ký ngay
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
