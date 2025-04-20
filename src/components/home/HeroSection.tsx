
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center py-16 md:py-24 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('https://i.imgur.com/byYdYpf.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          loading: 'lazy'
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content Card */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-4">
        <div className="bg-gray-800/85 backdrop-blur-sm rounded-xl shadow-lg p-8 md:p-12">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-inter">
              Premium Digital Products at{' '}
              <span className="text-[#10b981]">Unbeatable Prices</span>
            </h1>
            
            <p className="text-[#e5e7eb] text-lg mb-8">
              Discover a wide range of digital products including email accounts, gaming accounts, and software keys.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/category/email" 
                className="inline-flex justify-center items-center px-6 py-3 rounded-lg bg-[#10b981] text-white font-medium hover:bg-[#059669] transition-colors duration-200"
              >
                Explore Products
              </Link>
              <Link 
                to="/category/account" 
                className="inline-flex justify-center items-center px-6 py-3 rounded-lg bg-[#f9fafb] text-[#111827] font-medium hover:bg-[#e5e7eb] transition-colors duration-200"
              >
                View Featured
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
