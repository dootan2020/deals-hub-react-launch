
// Entry point just renders the relevant page (for demo purpose)
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Import pages directly with ES modules
import HomePage from './pages/index';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import ProductsPage from './pages/products';

// Select page to render by route (for basic routing simulation)
const path = window.location.pathname;

let Page: React.FC = () => <div>404 Not Found</div>;
if (path === '/' || path === '/index') {
  Page = HomePage;
} else if (path === '/login') {
  Page = LoginPage;
} else if (path === '/register') {
  Page = RegisterPage;
} else if (path === '/products') {
  Page = ProductsPage;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Page />
  </React.StrictMode>
);
