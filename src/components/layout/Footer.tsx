
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Digital Deals Hub</h3>
            <p className="text-text-light mb-4">
              Your trusted source for premium digital products and accounts at competitive prices.
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-primary mr-2" />
                <span className="text-text-light">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-primary mr-2" />
                <span className="text-text-light">support@digitaldeals.hub</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span className="text-text-light">123 Digital Avenue, San Francisco, CA 94107</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-text-light hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/category/email" className="text-text-light hover:text-primary transition-colors">
                  Email Accounts
                </Link>
              </li>
              <li>
                <Link to="/category/account" className="text-text-light hover:text-primary transition-colors">
                  Gaming Accounts
                </Link>
              </li>
              <li>
                <Link to="/category/other" className="text-text-light hover:text-primary transition-colors">
                  Software Keys
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-text-light hover:text-primary transition-colors">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faqs" className="text-text-light hover:text-primary transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/knowledge" className="text-text-light hover:text-primary transition-colors">
                  Knowledge Base
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-text-light hover:text-primary transition-colors">
                  Support Center
                </Link>
              </li>
              <li>
                <Link to="/deposit" className="text-text-light hover:text-primary transition-colors">
                  Deposit Funds
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-text-light hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-text-light mb-4">
              Subscribe to our newsletter to receive updates and special offers.
            </p>
            <form className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn-primary w-full"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Social Media & Payment Methods */}
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-4 mb-4 md:mb-0">
            <a href="#" className="text-text-light hover:text-primary transition-colors">
              <Facebook className="h-6 w-6" />
            </a>
            <a href="#" className="text-text-light hover:text-primary transition-colors">
              <Twitter className="h-6 w-6" />
            </a>
            <a href="#" className="text-text-light hover:text-primary transition-colors">
              <Instagram className="h-6 w-6" />
            </a>
            <a href="#" className="text-text-light hover:text-primary transition-colors">
              <Youtube className="h-6 w-6" />
            </a>
          </div>

          <div className="flex flex-wrap justify-center">
            <img src="https://placehold.co/50x30?text=Visa" alt="Visa" className="h-8 mx-1" />
            <img src="https://placehold.co/50x30?text=MC" alt="Mastercard" className="h-8 mx-1" />
            <img src="https://placehold.co/50x30?text=Amex" alt="American Express" className="h-8 mx-1" />
            <img src="https://placehold.co/50x30?text=PayPal" alt="PayPal" className="h-8 mx-1" />
            <img src="https://placehold.co/50x30?text=BTC" alt="Bitcoin" className="h-8 mx-1" />
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-text-light text-sm mt-8">
          &copy; {new Date().getFullYear()} Digital Deals Hub. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
