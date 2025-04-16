
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] py-16 md:py-24">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Text Content */}
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-text mb-4">
              Premium Digital Products at <span className="text-primary">Unbeatable Prices</span>
            </h1>
            <p className="text-text-light text-lg mb-8">
              Discover a wide range of digital products including email accounts, gaming accounts, and software keys.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link to="/category/email" className="btn-primary">
                Explore Products
              </Link>
              <Link to="/category/account" className="btn-outline">
                View Featured
              </Link>
            </div>
          </div>

          {/* Removed image section */}
          <div className="animate-scale-in hidden md:block bg-primary/10 rounded-lg flex items-center justify-center">
            <div className="text-center text-text-light p-8">
              <h2 className="text-2xl font-semibold mb-4">Digital Products Marketplace</h2>
              <p>Instant delivery of high-quality digital assets</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
