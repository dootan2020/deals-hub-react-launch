
import Layout from '@/components/layout/Layout';
import { Helmet } from 'react-helmet';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

const FaqsPage = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const faqs = [
    {
      question: 'How do I receive my digital products after purchase?',
      answer: 'After completing your purchase, your digital products will be available for immediate download in your account dashboard. You will also receive an email with download instructions and any relevant access codes or credentials.'
    },
    {
      question: 'Are the email accounts verified?',
      answer: 'Yes, all email accounts sold on our platform are fully verified and ready to use. Each account comes with complete access credentials and setup instructions.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, cryptocurrency (Bitcoin, Ethereum, and others), and various regional payment methods. You can see all available options during checkout.'
    },
    {
      question: 'Do you offer any guarantees with your products?',
      answer: 'Yes, we offer a 24-hour replacement guarantee for most digital products if they don\'t work as described. Some premium accounts come with extended guarantees of up to 30 days.'
    },
    {
      question: 'How secure is my payment information?',
      answer: 'Very secure. We use industry-standard encryption and secure payment processors. We don\'t store your full credit card details on our servers.'
    },
    {
      question: 'Can I get a refund if I\'m not satisfied?',
      answer: 'Due to the digital nature of our products, we generally don\'t offer refunds. However, we provide replacements if the product doesn\'t work as described within our guarantee period.'
    },
    {
      question: 'How do I contact customer support?',
      answer: 'You can contact our customer support team through the Support page, via email at support@digitaldeals.com, or through the live chat feature available on our website.'
    },
    {
      question: 'Are there any limitations on how I can use the accounts?',
      answer: 'Yes, each account type has specific terms of use. Generally, you should avoid suspicious activities, mass automation, or anything that violates the terms of service of the platform.'
    }
  ];
  
  const toggleFaq = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  
  const filteredFaqs = faqs.filter(
    faq => 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <Helmet>
        <title>Frequently Asked Questions | Digital Deals Hub</title>
        <meta name="description" content="Find answers to common questions about Digital Deals Hub products and services" />
      </Helmet>
      
      <div className="container-custom py-12 md:py-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Frequently Asked Questions</h1>
        
        <div className="max-w-3xl mx-auto">
          {/* Search */}
          <div className="relative mb-8">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search FAQs..."
              className="pl-10 pr-4 py-3 w-full border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* FAQ Accordion */}
          <div className="space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <button
                    className="flex justify-between items-center w-full p-4 text-left bg-white hover:bg-gray-50 transition-colors"
                    onClick={() => toggleFaq(index)}
                  >
                    <span className="font-medium">{faq.question}</span>
                    {activeIndex === index ? (
                      <ChevronUp className="h-5 w-5 text-primary" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  
                  {activeIndex === index && (
                    <div className="p-4 bg-gray-50 border-t">
                      <p className="text-text-light">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-text-light">No FAQs found matching "{searchTerm}"</p>
                <button
                  className="text-primary mt-2 hover:underline"
                  onClick={() => setSearchTerm('')}
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
          
          {/* Contact Support */}
          <div className="mt-12 text-center p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Can't find what you're looking for?</h2>
            <p className="text-text-light mb-4">
              Our support team is ready to answer your questions.
            </p>
            <a 
              href="/support" 
              className="inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FaqsPage;
