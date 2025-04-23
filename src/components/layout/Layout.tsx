
import { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout = ({ children, title }: LayoutProps) => {
  // Update document title if provided
  if (title) {
    document.title = `${title} | Digital Deals Hub`;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow overflow-x-hidden">
        {children}
      </main>
      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© {new Date().getFullYear()} Digital Deals Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
