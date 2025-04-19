
import Layout from '@/components/layout/Layout';
import { Helmet } from 'react-helmet';
import { Wallet, RefreshCw, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';

const DepositPage = () => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const predefinedAmounts = [50, 100, 200, 500];
  
  const paymentMethods = [
    { id: 'paypal', name: 'PayPal', icon: Wallet },
    { id: 'crypto', name: 'Cryptocurrency', icon: RefreshCw },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    
    toast.success(`Deposit request of $${amount} initiated. Redirecting to payment...`);
    // In a real app, this would redirect to payment processor or show next step
  };

  return (
    <Layout>
      <Helmet>
        <title>Deposit Funds | Digital Deals Hub</title>
        <meta name="description" content="Deposit funds to your Digital Deals Hub account" />
      </Helmet>
      
      <div className="container-custom py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Deposit Funds</h1>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Panel - Deposit Form */}
            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Add Funds to Your Account</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Select Amount</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    {predefinedAmounts.map(amt => (
                      <button
                        key={amt}
                        type="button"
                        className={`py-2 border rounded-md transition-colors ${
                          amount === amt.toString() 
                            ? 'bg-primary text-white border-primary' 
                            : 'bg-white text-text-light hover:border-primary'
                        }`}
                        onClick={() => setAmount(amt.toString())}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter custom amount"
                      min="1"
                      step="1"
                      className="w-full pl-8 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Select Payment Method</label>
                  <div className="space-y-2">
                    {paymentMethods.map((method) => (
                      <label key={method.id} className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={() => setPaymentMethod(method.id)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <method.icon className="h-5 w-5 ml-3 mr-2 text-gray-500" />
                        <span className="ml-2">{method.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-3 rounded-md flex items-center justify-center hover:bg-primary-dark transition-colors"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </form>
            </div>
            
            {/* Right Panel - Info */}
            <div className="md:col-span-1 space-y-4">
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold mb-2">Account Balance</h3>
                <p className="text-2xl font-bold text-primary">$0.00</p>
                <p className="text-sm text-text-light mt-1">Available for purchases</p>
              </div>
              
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-start">
                  <RefreshCw className="h-5 w-5 text-green-500 mt-1 mr-2" />
                  <div>
                    <h3 className="font-semibold">Instant Credit</h3>
                    <p className="text-sm text-text-light">Funds are added to your account immediately.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-sm text-text-light mb-3">
                  Contact our support team if you have any questions about deposits.
                </p>
                <a 
                  href="/support" 
                  className="text-primary hover:underline text-sm font-medium"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DepositPage;
