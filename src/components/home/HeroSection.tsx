
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative min-h-[600px] py-16 md:py-24 overflow-hidden">
      {/* Background Image with Blur Effect */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/lovable-uploads/2e4fb3ed-d351-4846-8613-dd834e00be9b.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="container-custom relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="animate-fade-in max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Premium Digital Products at <span className="text-primary">Unbeatable Prices</span>
            </h1>
            <p className="text-gray-200 text-lg mb-8">
              Discover a wide range of digital products including email accounts, gaming accounts, and software keys.
            </p>

            <div className="flex justify-center gap-4">
              <Link 
                to="/category/email" 
                className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-md transition-all duration-300 hover:scale-105"
              >
                Explore Products
              </Link>
              <Link 
                to="/category/account" 
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-md transition-all duration-300 hover:bg-white/20"
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
