
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import FeaturesSection from '@/components/home/FeaturesSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Home: React.FC = () => {  
  return (
    <Layout>
      <HeroSection />
      <CategorySection />
      <FeaturesSection />
      <TestimonialsSection />
      
      <section className="py-16 bg-primary/10">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Sẵn sàng khám phá các sản phẩm số?
          </h2>
          <p className="text-lg text-text-light max-w-2xl mx-auto mb-8">
            Hàng nghìn tài khoản Gmail, Facebook, công cụ AI và các sản phẩm số khác đang chờ bạn với giá tốt nhất thị trường.
          </p>
          <Link to="/products">
            <Button size="lg" className="gap-2 px-8">
              Xem tất cả sản phẩm
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
