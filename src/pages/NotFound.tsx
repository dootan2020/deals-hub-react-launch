
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';

const NotFound = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <h1 className="text-6xl font-bold text-primary mb-6">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-text-light mb-8 max-w-lg">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-primary">
          Return to Homepage
        </Link>
      </div>
    </Layout>
  );
};

export default NotFound;
