
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] py-16 md:py-24">
      <div className="container-custom">
        <div className="flex flex-col items-center text-center">
          <div className="animate-fade-in max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-text mb-4">
              Premium Digital Products at <span className="text-primary">Unbeatable Prices</span>
            </h1>
            <p className="text-text-light text-lg mb-8">
              Discover a wide range of digital products including email accounts, gaming accounts, and software keys.
            </p>

            <div className="flex justify-center gap-4">
              <Link to="/category/email" className="btn-primary">
                Explore Products
              </Link>
              <Link to="/category/account" className="btn-outline">
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
