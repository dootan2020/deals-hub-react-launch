
// Entry point just renders the relevant page (for demo purpose)
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';

// Select page to render by route (for basic routing simulation)
const path = window.location.pathname;

let Page: React.FC = () => <div>404 Not Found</div>;
if (path === '/' || path === '/index') {
  Page = require('./pages/index.tsx').default;
} else if (path === '/login') {
  Page = require('./pages/login.tsx').default;
} else if (path === '/register') {
  Page = require('./pages/register.tsx').default;
} else if (path === '/products') {
  Page = require('./pages/products.tsx').default;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Page />
  </React.StrictMode>
);
