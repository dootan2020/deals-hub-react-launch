
import Layout from '@/components/layout/Layout';
import { Helmet } from 'react-helmet';
import { Search, BookOpen, FileText, Video, HelpCircle, RefreshCw, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const KnowledgeBasePage = () => {
  const categories = [
    {
      title: 'Getting Started',
      icon: BookOpen,
      description: 'Learn how to get started with our digital products',
      articles: [
        'Creating your account',
        'Making your first purchase',
        'Downloading your digital products',
        'Account security best practices'
      ]
    },
    {
      title: 'Email Accounts',
      icon: FileText,
      description: 'Guides for setting up and using email accounts',
      articles: [
        'Setting up Gmail on mobile devices',
        'Adding email accounts to desktop clients',
        'Email account security tips',
        'Troubleshooting common email issues'
      ]
    },
    {
      title: 'Gaming Accounts',
      icon: Video,
      description: 'Learn how to use gaming accounts and services',
      articles: [
        'Accessing Steam accounts safely',
        'Downloading games from your account',
        'Managing gaming libraries',
        'Gaming account security measures'
      ]
    },
    {
      title: 'Software Keys',
      icon: Award,
      description: 'How to activate and use software product keys',
      articles: [
        'Activating Windows with your product key',
        'Office installation guide',
        'Antivirus software setup',
        'Software license management'
      ]
    },
    {
      title: 'Account Management',
      icon: RefreshCw,
      description: 'Managing your Digital Deals Hub account',
      articles: [
        'Updating your profile information',
        'Viewing order history',
        'Managing payment methods',
        'Account notification settings'
      ]
    },
    {
      title: 'Troubleshooting',
      icon: HelpCircle,
      description: 'Solutions for common problems',
      articles: [
        'Product access issues',
        'Payment complications',
        'Download problems',
        'Account login troubleshooting'
      ]
    }
  ];

  return (
    <Layout>
      <Helmet>
        <title>Knowledge Base | Digital Deals Hub</title>
        <meta name="description" content="Browse our knowledge base for guides, tutorials and documentation" />
      </Helmet>
      
      <div className="container-custom py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">Knowledge Base</h1>
          <p className="text-text-light text-center mb-10 max-w-2xl mx-auto">
            Find guides, tutorials, and documentation to help you make the most of our digital products.
          </p>
          
          {/* Search */}
          <div className="relative mb-12 max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search knowledge base..."
              className="pl-10 pr-4 py-3 w-full border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          {/* Categories */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <category.icon className="h-6 w-6 text-primary mr-3" />
                  <h2 className="text-xl font-semibold">{category.title}</h2>
                </div>
                <p className="text-text-light mb-4">{category.description}</p>
                <ul className="space-y-2">
                  {category.articles.map((article, j) => (
                    <li key={j}>
                      <a href="#" className="text-accent hover:text-accent-dark transition-colors hover:underline">
                        {article}
                      </a>
                    </li>
                  ))}
                </ul>
                <a href="#" className="mt-4 inline-block text-primary font-medium hover:underline">
                  View all articles
                </a>
              </div>
            ))}
          </div>
          
          {/* Contact Support */}
          <div className="mt-12 text-center p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Can't find what you're looking for?</h2>
            <p className="text-text-light mb-4">
              Our support team is ready to help you with any questions.
            </p>
            <Link 
              to="/support" 
              className="inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default KnowledgeBasePage;
