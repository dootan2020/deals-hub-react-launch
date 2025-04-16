
import { useState } from 'react';
import { Mail } from 'lucide-react';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubscribed(true);
      setEmail('');
    }, 1000);
  };

  return (
    <section className="py-16 bg-primary">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-white/20 rounded-full">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold mb-4">Stay Updated with Our Latest Offers</h2>
          <p className="mb-8">
            Subscribe to our newsletter to receive exclusive deals and be the first to know about our latest products.
          </p>

          {subscribed ? (
            <div className="bg-white/20 p-4 rounded-lg animate-fade-in">
              <p className="text-white font-medium">
                Thank you for subscribing! Check your inbox for a confirmation email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 rounded-md border-none focus:outline-none focus:ring-2 focus:ring-white/50 text-text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-white text-primary hover:bg-white/90 px-6 py-3 rounded-md font-medium transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          )}
          
          <p className="mt-4 text-sm text-white/80">
            We respect your privacy and will never share your information.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
