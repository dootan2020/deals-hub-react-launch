
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Wallet, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Layout>
      <div className="bg-gradient-to-b from-primary/10 to-white">
        <div className="container mx-auto py-16 md:py-24 px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Digital Deals Hub
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-8">
            Your trusted source for premium digital products
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/products">
              <Button size="lg" className="gap-2">
                <ShoppingBag className="h-5 w-5" />
                Browse Products
              </Button>
            </Link>
            
            {!isAuthenticated ? (
              <Link to="/register">
                <Button variant="outline" size="lg" className="gap-2">
                  <UserPlus className="h-5 w-5" />
                  Create Account
                </Button>
              </Link>
            ) : (
              <Link to="/deposit">
                <Button variant="outline" size="lg" className="gap-2">
                  <Wallet className="h-5 w-5" />
                  Deposit Funds
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Core Features</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Simple Authentication</h3>
            <p className="text-gray-600">
              Create an account or log in to access our full range of digital products and services.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Deposits</h3>
            <p className="text-gray-600">
              Add funds to your account with our secure deposit system for quick and hassle-free purchases.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Instant Purchases</h3>
            <p className="text-gray-600">
              Browse our catalog and make instant purchases with your account balance.
            </p>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <Link to="/products">
            <Button size="lg">Explore Products</Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
