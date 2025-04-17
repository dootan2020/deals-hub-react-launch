
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 h-full"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-4 bg-primary/10 rounded-full mb-5 transform transition-transform duration-300 group-hover:scale-110">
                  <feature.icon className="h-9 w-9 text-primary transition-colors duration-300 hover:text-primary-dark" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-text-light text-sm md:text-base">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
