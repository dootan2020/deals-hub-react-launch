
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Helmet } from 'react-helmet';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  return (
    <Layout>
      <Helmet>
        <title>Page Not Found | Digital Deals Hub</title>
        <meta name="description" content="The page you're looking for doesn't exist or has been moved." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="text-8xl font-bold text-primary mb-6">404</div>
        <h1 className="text-3xl font-semibold mb-4">Page Not Found</h1>
        <p className="text-text-light mb-8 max-w-lg">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <Button asChild size="lg">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Homepage
          </Link>
        </Button>
        <div className="mt-12 text-sm text-text-light">
          <p className="mb-2">Here are some helpful links instead:</p>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Link to="/" className="text-primary hover:underline">Home</Link>
            <Link to="/support" className="text-primary hover:underline">Support</Link>
            <Link to="/faqs" className="text-primary hover:underline">FAQs</Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
