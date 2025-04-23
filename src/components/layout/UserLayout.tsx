
import React from 'react';
import Layout from './Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface UserLayoutProps {
  children: React.ReactNode;
  title?: string;
  activeTab?: string;
}

export default function UserLayout({
  children,
  title = 'Tài khoản',
  activeTab = 'overview',
}: UserLayoutProps) {
  const location = useLocation();
  const { user } = useAuth();
  
  return (
    <Layout title={title}>
      <div className="container py-6 md:py-10">
        {/* Removed VerifyEmailBanner */}
        
        <h1 className="text-2xl font-bold mb-6">{title}</h1>
        
        <Tabs defaultValue={activeTab} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger 
              value="overview" 
              onClick={() => location.pathname !== '/dashboard' && window.location.assign('/dashboard')}
              className={activeTab === 'overview' ? 'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground' : ''}
            >
              Tổng quan
            </TabsTrigger>
            <TabsTrigger 
              value="account" 
              onClick={() => location.pathname !== '/account' && window.location.assign('/account')}
              className={activeTab === 'account' ? 'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground' : ''}
            >
              Cài đặt tài khoản
            </TabsTrigger>
            <TabsTrigger 
              value="deposit-history" 
              onClick={() => location.pathname !== '/deposit-history' && window.location.assign('/deposit-history')}
              className={activeTab === 'deposit-history' ? 'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground' : ''}
            >
              Lịch sử nạp tiền
            </TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-0">
            {children}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

