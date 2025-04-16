
import { useState } from 'react';
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

          {/* Hero Image */}
          <div className="animate-scale-in hidden md:block">
            <img
              src="https://placehold.co/600x400?text=Digital+Deals+Hub"
              alt="Digital Deals Hub"
              className="w-full h-auto rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
