
import Layout from '@/components/layout/Layout';
import { Helmet } from 'react-helmet';

const SupportPage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Support | Digital Deals Hub</title>
        <meta name="description" content="Get support for your purchases on Digital Deals Hub" />
      </Helmet>
      
      <div className="container-custom py-12 md:py-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Support Center</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Contact Support</h2>
            <p className="text-text-light mb-6">
              Our support team is available 24/7 to help you with any questions or issues you may have.
            </p>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Your Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Order ID (optional)</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter order ID if applicable"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea 
                  className="w-full px-4 py-2 border rounded-md h-32 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Describe your issue or question"
                ></textarea>
              </div>
              
              <button 
                type="submit"
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
              >
                Submit Request
              </button>
            </form>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">FAQ</h2>
              <p className="text-text-light">
                Find answers to commonly asked questions about our products and services.
              </p>
              <a href="/faqs" className="text-primary font-medium mt-2 block hover:underline">
                View FAQs
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">Knowledge Base</h2>
              <p className="text-text-light">
                Explore our comprehensive guides and tutorials.
              </p>
              <a href="/knowledge" className="text-primary font-medium mt-2 block hover:underline">
                Browse Knowledge Base
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">Live Chat</h2>
              <p className="text-text-light">
                Connect with our support team instantly via live chat.
              </p>
              <button className="text-primary font-medium mt-2 block hover:underline">
                Start Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SupportPage;
