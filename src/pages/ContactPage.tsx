
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ContactPage = () => {
  return (
    <Layout title="Liên hệ | AccZen.net">
      <div className="container-custom py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Liên hệ với chúng tôi</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-6">Thông tin liên hệ</h2>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Email hỗ trợ</p>
                    <a href="mailto:support@acczen.net" className="text-primary hover:underline">
                      support@acczen.net
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Hotline</p>
                    <a href="tel:+84123456789" className="text-primary hover:underline">
                      +84 123 456 789
                    </a>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium mb-2">Giờ làm việc</p>
                  <p className="text-text-light">24/7 - Hỗ trợ liên tục</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-6">Gửi tin nhắn</h2>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Họ tên</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Nhập họ tên của bạn"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Nhập email của bạn"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Tin nhắn</label>
                  <textarea 
                    className="w-full px-4 py-2 border rounded-md h-32 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Nhập nội dung tin nhắn"
                  ></textarea>
                </div>
                
                <Button type="submit" className="w-full">
                  Gửi tin nhắn
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;
