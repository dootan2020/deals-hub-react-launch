
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import FeaturesSection from '@/components/home/FeaturesSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import SearchSection from '@/components/home/SearchSection';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const Home = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Layout>
      <HeroSection />
      
      {/* Quick action buttons */}
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/products">
            <Button variant="outline" size="lg" className="shadow-sm">
              Xem tất cả sản phẩm
            </Button>
          </Link>
          
          {!isAuthenticated && (
            <>
              <Link to="/login">
                <Button variant="default" size="lg" className="shadow-sm">
                  Đăng nhập
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary" size="lg" className="shadow-sm">
                  Đăng ký
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
      
      <CategorySection />
      <SearchSection />
      <FeaturesSection />
      <TestimonialsSection />
    </Layout>
  );
};

export default Home;
