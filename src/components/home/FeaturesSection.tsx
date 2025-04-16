
import { Shield, Zap, Clock, HeadphonesIcon } from 'lucide-react';

const features = [
  {
    title: 'Secure Transactions',
    description: 'All payments are processed through secure, encrypted channels for your peace of mind.',
    icon: Shield,
  },
  {
    title: 'Instant Delivery',
    description: 'Get your digital products delivered instantly to your email after purchase.',
    icon: Zap,
  },
  {
    title: '24/7 Availability',
    description: 'Our automated system allows you to purchase products at any time, day or night.',
    icon: Clock,
  },
  {
    title: 'Customer Support',
    description: 'Our friendly support team is always ready to help with any issues or questions.',
    icon: HeadphonesIcon,
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose Us</h2>
          <p className="text-text-light max-w-2xl mx-auto">
            We provide the best digital products with outstanding customer service and competitive prices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-primary/10 rounded-full mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-text-light">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
